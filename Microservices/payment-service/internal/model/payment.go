package model

import "time"

type Payment struct {
	ID        string    `json:"id"`
	OrderID   string    `json:"order_id"`
	UserID    string    `json:"user_id"`
	Amount    float64   `json:"amount"`
	Status    string    `json:"status"` // pending, success, failed, expired, cancelled
	SnapURL   string    `json:"snap_url,omitempty"`
	SnapToken string    `json:"snap_token,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreatePaymentRequest struct {
	OrderID string `json:"order_id"`
}
