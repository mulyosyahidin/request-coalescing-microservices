package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"order-service/internal/model"
)

var (
	ErrOrderNotFound = errors.New("order not found")
)

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *model.Order) error
	GetOrder(ctx context.Context, id string) (*model.Order, error)
	ListOrders(ctx context.Context, userID *string, limit, offset int) ([]*model.Order, int, error)
	UpdateOrderStatus(ctx context.Context, id string, status model.OrderStatus) error
}

type orderRepository struct {
	db *pgxpool.Pool
}

func NewOrderRepository(db *pgxpool.Pool) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) CreateOrder(ctx context.Context, order *model.Order) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO orders (user_id, status, total_amount) 
		VALUES ($1, $2, $3) 
		RETURNING id, created_at, updated_at`

	err = tx.QueryRow(ctx, query, order.UserID, order.Status, order.TotalAmount).
		Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		return err
	}

	for i := range order.Items {
		item := &order.Items[i]
		itemQuery := `
			INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id`
		
		err = tx.QueryRow(ctx, itemQuery, order.ID, item.ProductID, item.ProductName, item.Price, item.Quantity).
			Scan(&item.ID)
		if err != nil {
			return err
		}
		item.OrderID = order.ID
	}

	return tx.Commit(ctx)
}

func (r *orderRepository) GetOrder(ctx context.Context, id string) (*model.Order, error) {
	query := `SELECT id, user_id, status, total_amount, created_at, updated_at FROM orders WHERE id = $1`
	order := &model.Order{}
	
	err := r.db.QueryRow(ctx, query, id).Scan(
		&order.ID, &order.UserID, &order.Status, &order.TotalAmount, &order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	itemsQuery := `SELECT id, order_id, product_id, product_name, price, quantity FROM order_items WHERE order_id = $1`
	rows, err := r.db.Query(ctx, itemsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item model.OrderItem
		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.ProductName, &item.Price, &item.Quantity); err != nil {
			return nil, err
		}
		order.Items = append(order.Items, item)
	}

	return order, nil
}

func (r *orderRepository) ListOrders(ctx context.Context, userID *string, limit, offset int) ([]*model.Order, int, error) {
	var countQuery string
	var total int
	var err error

	if userID != nil {
		countQuery = `SELECT count(*) FROM orders WHERE user_id = $1`
		err = r.db.QueryRow(ctx, countQuery, *userID).Scan(&total)
	} else {
		countQuery = `SELECT count(*) FROM orders`
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	if err != nil {
		return nil, 0, err
	}

	var rows pgx.Rows
	if userID != nil {
		query := `SELECT id, user_id, status, total_amount, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
		rows, err = r.db.Query(ctx, query, *userID, limit, offset)
	} else {
		query := `SELECT id, user_id, status, total_amount, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`
		rows, err = r.db.Query(ctx, query, limit, offset)
	}
	
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []*model.Order
	for rows.Next() {
		order := &model.Order{}
		if err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.TotalAmount, &order.CreatedAt, &order.UpdatedAt); err != nil {
			return nil, 0, err
		}
		orders = append(orders, order)
	}

	return orders, total, nil
}

func (r *orderRepository) UpdateOrderStatus(ctx context.Context, id string, status model.OrderStatus) error {
	query := `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`
	tag, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrOrderNotFound
	}
	return nil
}
