package handler

import (
	"encoding/json"
	"net/http"

	"payment-service/internal/middleware"
	"payment-service/internal/model"
	"payment-service/internal/service"

	"github.com/go-chi/chi/v5"
)

func RespondError(w http.ResponseWriter, statusCode int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"message": message,
		"error": map[string]string{
			"code": code,
		},
	})
}

func RespondSuccess(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": message,
		"data":    data,
	})
}

type PaymentHandler struct {
	svc service.PaymentService
}

func NewPaymentHandler(svc service.PaymentService) *PaymentHandler {
	return &PaymentHandler{svc: svc}
}

func (h *PaymentHandler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "User ID not found in context")
		return
	}

	var req model.CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	token := r.Header.Get("Authorization")

	payment, err := h.svc.CreatePayment(r.Context(), req.OrderID, userID, token)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusCreated, "Payment created successfully", payment)
}

func (h *PaymentHandler) GetPaymentByOrderID(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "orderId")

	payment, err := h.svc.GetPaymentByOrderID(r.Context(), orderID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Payment not found")
		return
	}

	RespondSuccess(w, http.StatusOK, "Payment retrieved successfully", payment)
}

func (h *PaymentHandler) HandleNotification(w http.ResponseWriter, r *http.Request) {
	var notificationPayload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&notificationPayload); err != nil {
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	err := h.svc.HandleNotification(r.Context(), notificationPayload)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Notification processed", nil)
}
