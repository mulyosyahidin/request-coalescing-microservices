package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"order-service/internal/middleware"
	"order-service/internal/model"
	"order-service/internal/repository"
	"order-service/internal/service"
)

type OrderHandler struct {
	svc service.OrderService
}

func NewOrderHandler(svc service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "User ID not found in context")
		return
	}

	email, _ := r.Context().Value(middleware.EmailKey).(string)

	var req service.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	order, paymentInfo, err := h.svc.CreateOrder(r.Context(), userID, email, req)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			RespondError(w, http.StatusBadRequest, "PRODUCT_UNAVAILABLE", err.Error())
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create order")
		return
	}

	data := map[string]interface{}{
		"order": order,
	}
	if paymentInfo != nil {
		data["payment"] = paymentInfo
	}

	RespondSuccess(w, http.StatusCreated, "Order created successfully", data)
}

func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	role, _ := r.Context().Value(middleware.RoleKey).(string)

	order, err := h.svc.GetOrder(r.Context(), id, userID, role)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Order not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to get order")
		return
	}

	RespondSuccess(w, http.StatusOK, "Order retrieved successfully", order)
}

func (h *OrderHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	role, _ := r.Context().Value(middleware.RoleKey).(string)

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	orders, total, err := h.svc.ListOrders(r.Context(), userID, role, limit, offset)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list orders")
		return
	}

	RespondSuccess(w, http.StatusOK, "Orders retrieved successfully", map[string]interface{}{
		"orders": orders,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req struct {
		Status model.OrderStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	err := h.svc.UpdateOrderStatus(r.Context(), id, req.Status)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Order not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to update order status")
		return
	}

	RespondSuccess(w, http.StatusOK, "Order status updated successfully", nil)
}

func (h *OrderHandler) HandlePaymentCallback(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}
	
	// Convert external payment status to order status
	var orderStatus model.OrderStatus
	switch req.Status {
	case "paid":
		orderStatus = model.StatusPaid
	case "expired":
		orderStatus = model.StatusExpired
	case "cancelled", "denied":
		orderStatus = model.StatusCancelled
	case "pending":
		orderStatus = model.StatusPendingPayment
	default:
		RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid status mapping")
		return
	}

	err := h.svc.UpdateOrderStatus(r.Context(), id, orderStatus)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to update order status")
		return
	}

	RespondSuccess(w, http.StatusOK, "Order payment status updated", nil)
}
