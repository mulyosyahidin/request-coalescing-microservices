package repository

import (
	"context"
	"fmt"
	"payment-service/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PaymentRepository interface {
	Create(ctx context.Context, p *model.Payment) error
	GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error)
	GetByID(ctx context.Context, id string) (*model.Payment, error)
	UpdateStatus(ctx context.Context, orderID string, status string) error
}

type paymentRepository struct {
	db *pgxpool.Pool
}

func NewPaymentRepository(db *pgxpool.Pool) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(ctx context.Context, p *model.Payment) error {
	query := `
		INSERT INTO payments (order_id, user_id, amount, status, snap_url, snap_token)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		p.OrderID, p.UserID, p.Amount, p.Status, p.SnapURL, p.SnapToken,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}
	return nil
}

func (r *paymentRepository) GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error) {
	query := `
		SELECT id, order_id, user_id, amount, status, snap_url, snap_token, created_at, updated_at
		FROM payments WHERE order_id = $1
	`
	p := &model.Payment{}
	err := r.db.QueryRow(ctx, query, orderID).Scan(
		&p.ID, &p.OrderID, &p.UserID, &p.Amount, &p.Status, &p.SnapURL, &p.SnapToken, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment by order_id: %w", err)
	}
	return p, nil
}

func (r *paymentRepository) GetByID(ctx context.Context, id string) (*model.Payment, error) {
	query := `
		SELECT id, order_id, user_id, amount, status, snap_url, snap_token, created_at, updated_at
		FROM payments WHERE id = $1
	`
	p := &model.Payment{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.OrderID, &p.UserID, &p.Amount, &p.Status, &p.SnapURL, &p.SnapToken, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment by id: %w", err)
	}
	return p, nil
}

func (r *paymentRepository) UpdateStatus(ctx context.Context, orderID string, status string) error {
	query := `
		UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE order_id = $2
	`
	_, err := r.db.Exec(ctx, query, status, orderID)
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}
	return nil
}
