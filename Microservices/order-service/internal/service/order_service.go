package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"order-service/internal/model"
	"order-service/internal/repository"
)

var (
	ErrProductNotFound = errors.New("product not found or service unavailable")
	ErrPaymentFailed   = errors.New("failed to initialize payment")
)

type CreateOrderRequest struct {
	Items []CreateOrderItemRequest `json:"items"`
}

type CreateOrderItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type OrderPaymentInfo struct {
	ID        string `json:"id"`
	SnapToken string `json:"snap_token"`
	SnapURL   string `json:"snap_url"`
}

type OrderService interface {
	CreateOrder(ctx context.Context, userID, userEmail string, req CreateOrderRequest) (*model.Order, *OrderPaymentInfo, error)
	GetOrder(ctx context.Context, id, userID, role string) (*model.Order, error)
	ListOrders(ctx context.Context, userID, role string, limit, offset int) ([]*model.Order, int, error)
	UpdateOrderStatus(ctx context.Context, id string, status model.OrderStatus) error
}

type orderService struct {
	repo              repository.OrderRepository
	productServiceURL string
	paymentServiceURL string
	httpClient        *http.Client
}

func NewOrderService(repo repository.OrderRepository, productURL, paymentURL string) OrderService {
	return &orderService{
		repo:              repo,
		productServiceURL: productURL,
		paymentServiceURL: paymentURL,
		httpClient:        &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *orderService) CreateOrder(ctx context.Context, userID, userEmail string, req CreateOrderRequest) (*model.Order, *OrderPaymentInfo, error) {
	if len(req.Items) == 0 {
		return nil, nil, errors.New("order must have at least one item")
	}

	order := &model.Order{
		UserID: userID,
		Status: model.StatusPendingPayment,
	}

	var totalAmount float64

	// 1. Fetch product details and prices
	for _, itemReq := range req.Items {
		if itemReq.Quantity <= 0 {
			return nil, nil, errors.New("item quantity must be greater than zero")
		}

		productReq, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/v1/products/%s", s.productServiceURL, itemReq.ProductID), nil)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create request: %w", err)
		}

		resp, err := s.httpClient.Do(productReq)
		if err != nil {
			return nil, nil, fmt.Errorf("%w: %v", ErrProductNotFound, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, nil, fmt.Errorf("%w: HTTP %d", ErrProductNotFound, resp.StatusCode)
		}

		var productResp struct {
			Success bool `json:"success"`
			Data    struct {
				ID    string  `json:"id"`
				Name  string  `json:"name"`
				Price float64 `json:"price"`
			} `json:"data"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&productResp); err != nil {
			return nil, nil, err
		}

		if !productResp.Success {
			return nil, nil, ErrProductNotFound
		}

		price := productResp.Data.Price
		order.Items = append(order.Items, model.OrderItem{
			ProductID:   productResp.Data.ID,
			ProductName: productResp.Data.Name,
			Price:       price,
			Quantity:    itemReq.Quantity,
		})
		totalAmount += price * float64(itemReq.Quantity)
	}

	order.TotalAmount = totalAmount

	// 2. Save order to database
	if err := s.repo.CreateOrder(ctx, order); err != nil {
		return nil, nil, err
	}

	// 3. Create payment via payment-service
	paymentReqBody := map[string]interface{}{
		"order_id": order.ID,
		"user_id":  userID,
		"amount":   order.TotalAmount,
		"items":    order.Items,
		"customer": map[string]string{
			"email": userEmail,
		},
	}

	bodyBytes, _ := json.Marshal(paymentReqBody)
	paymentReq, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/v1/payments", s.paymentServiceURL), bytes.NewBuffer(bodyBytes))
	if err == nil {
		paymentReq.Header.Set("Content-Type", "application/json")
		paymentResp, err := s.httpClient.Do(paymentReq)
		
		// We proceed even if payment creation fails (to allow retries or handling by client),
		// or we can fail the whole transaction. The spec says payment-service will return snap token.
		var paymentInfo *OrderPaymentInfo
		if err == nil && paymentResp.StatusCode == http.StatusOK {
			defer paymentResp.Body.Close()
			var pResp struct {
				Success bool `json:"success"`
				Data    struct {
					ID        string `json:"id"`
					SnapToken string `json:"snap_token"`
					SnapURL   string `json:"snap_url"`
				} `json:"data"`
			}
			if err := json.NewDecoder(paymentResp.Body).Decode(&pResp); err == nil && pResp.Success {
				paymentInfo = &OrderPaymentInfo{
					ID:        pResp.Data.ID,
					SnapToken: pResp.Data.SnapToken,
					SnapURL:   pResp.Data.SnapURL,
				}
			}
		}
		
		// If paymentInfo is still nil here, we could return the order but without payment info, 
		// but typically we'd want the payment info to be successfully generated.
		// For MVP, we return whatever we have.
		return order, paymentInfo, nil
	}

	return order, nil, nil
}

func (s *orderService) GetOrder(ctx context.Context, id, userID, role string) (*model.Order, error) {
	order, err := s.repo.GetOrder(ctx, id)
	if err != nil {
		return nil, err
	}

	// Customer can only see their own order
	if role != "admin" && order.UserID != userID {
		return nil, repository.ErrOrderNotFound
	}

	return order, nil
}

func (s *orderService) ListOrders(ctx context.Context, userID, role string, limit, offset int) ([]*model.Order, int, error) {
	var targetUserID *string
	if role != "admin" {
		targetUserID = &userID
	}
	return s.repo.ListOrders(ctx, targetUserID, limit, offset)
}

func (s *orderService) UpdateOrderStatus(ctx context.Context, id string, status model.OrderStatus) error {
	return s.repo.UpdateOrderStatus(ctx, id, status)
}
