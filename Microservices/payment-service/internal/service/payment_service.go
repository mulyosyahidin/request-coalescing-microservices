package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"payment-service/internal/config"
	"payment-service/internal/model"
	"payment-service/internal/repository"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type PaymentService interface {
	CreatePayment(ctx context.Context, orderID string, userID string, token string) (*model.Payment, error)
	HandleNotification(ctx context.Context, req map[string]interface{}) error
	GetPaymentByOrderID(ctx context.Context, orderID string) (*model.Payment, error)
}

type paymentService struct {
	repo       repository.PaymentRepository
	cfg        *config.Config
	snapClient snap.Client
}

func NewPaymentService(repo repository.PaymentRepository, cfg *config.Config) PaymentService {
	env := midtrans.Sandbox
	if cfg.MidtransEnv == "production" {
		env = midtrans.Production
	}

	client := snap.Client{}
	client.New(cfg.MidtransServerKey, env)

	return &paymentService{
		repo:       repo,
		cfg:        cfg,
		snapClient: client,
	}
}

func (s *paymentService) CreatePayment(ctx context.Context, orderID string, userID string, token string) (*model.Payment, error) {
	// Check if payment already exists
	existingPayment, err := s.repo.GetByOrderID(ctx, orderID)
	if err == nil && existingPayment != nil {
		if existingPayment.Status == "pending" {
			// If already exists and pending, return it
			return existingPayment, nil
		}
	}

	// 1. Fetch order details from order-service
	orderURL := fmt.Sprintf("%s/api/v1/orders/%s", s.cfg.OrderServiceURL, orderID)
	req, err := http.NewRequestWithContext(ctx, "GET", orderURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request to order-service: %w", err)
	}
	
	req.Header.Set("Authorization", token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call order-service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("order-service returned status: %d", resp.StatusCode)
	}

	var orderResp struct {
		Data struct {
			TotalAmount float64 `json:"total_amount"`
			Items       []struct {
				ProductName string  `json:"product_name"`
				Price       float64 `json:"price"`
				Quantity    int     `json:"quantity"`
			} `json:"items"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&orderResp); err != nil {
		return nil, fmt.Errorf("failed to decode order details: %w", err)
	}

	amount := orderResp.Data.TotalAmount

	// 2. Generate Midtrans Snap Token
	// Construct the frontend return URL
	returnUrl := fmt.Sprintf("%s/customer/orders/%s", s.cfg.FrontendURL, orderID)

	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(amount),
		},
		CreditCard: &snap.CreditCardDetails{
			Secure: true,
		},
		Callbacks: &snap.Callbacks{
			Finish:   returnUrl,
		},
	}

	snapResp, snapErr := s.snapClient.CreateTransaction(snapReq)
	if snapErr != nil {
		return nil, fmt.Errorf("failed to generate snap token: %v", snapErr)
	}

	// 3. Save to database
	p := &model.Payment{
		OrderID:   orderID,
		UserID:    userID,
		Amount:    amount,
		Status:    "pending",
		SnapURL:   snapResp.RedirectURL,
		SnapToken: snapResp.Token,
	}

	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}

	return p, nil
}

func (s *paymentService) GetPaymentByOrderID(ctx context.Context, orderID string) (*model.Payment, error) {
	return s.repo.GetByOrderID(ctx, orderID)
}

func (s *paymentService) HandleNotification(ctx context.Context, req map[string]interface{}) error {
	orderID, ok := req["order_id"].(string)
	if !ok {
		return fmt.Errorf("missing order_id in notification")
	}

	transactionStatus, _ := req["transaction_status"].(string)
	fraudStatus, _ := req["fraud_status"].(string)

	var paymentStatus string
	
	// Map Midtrans status to internal status
	switch transactionStatus {
	case "capture":
		if fraudStatus == "challenge" {
			paymentStatus = "pending"
		} else if fraudStatus == "accept" {
			paymentStatus = "paid"
		}
	case "settlement":
		paymentStatus = "paid"
	case "cancel", "deny", "expire":
		paymentStatus = transactionStatus // cancel, deny, expire mapping
		if transactionStatus == "expire" {
			paymentStatus = "expired"
		} else {
			paymentStatus = "cancelled"
		}
	case "pending":
		paymentStatus = "pending"
	default:
		paymentStatus = transactionStatus
	}

	// 1. Update Payment DB
	if err := s.repo.UpdateStatus(ctx, orderID, paymentStatus); err != nil {
		log.Printf("failed to update payment status: %v\n", err)
		return err
	}

	// 2. Notify Order Service
	go func() {
		callbackURL := fmt.Sprintf("%s/internal/orders/%s/payment-status", s.cfg.OrderServiceURL, orderID)
		payload := map[string]string{"status": paymentStatus}
		payloadBytes, _ := json.Marshal(payload)
		
		notifyReq, _ := http.NewRequest("POST", callbackURL, bytes.NewBuffer(payloadBytes))
		notifyReq.Header.Set("Content-Type", "application/json")
		// internal service doesn't strictly need JWT if internal routes bypass gateway, but good to ensure
		
		client := &http.Client{}
		res, err := client.Do(notifyReq)
		if err != nil {
			log.Printf("failed to notify order-service for order %s: %v\n", orderID, err)
			return
		}
		defer res.Body.Close()
		log.Printf("Notified order-service for order %s, status: %s\n", orderID, paymentStatus)
	}()

	return nil
}
