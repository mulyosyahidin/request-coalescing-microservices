package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"product-service/internal/metrics"
	"product-service/internal/model"
)

var ErrProductNotFound = errors.New("product not found")

type ProductRepository interface {
	GetProducts(ctx context.Context, limit, offset int) ([]*model.Product, int, error)
	GetProductByID(ctx context.Context, id string) (*model.Product, error)
	CreateProduct(ctx context.Context, p *model.Product) error
	UpdateProduct(ctx context.Context, p *model.Product) error
	DeleteProduct(ctx context.Context, id string) error
}

type PostgresProductRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) ProductRepository {
	return &PostgresProductRepository{db: db}
}

func (r *PostgresProductRepository) GetProducts(ctx context.Context, limit, offset int) ([]*model.Product, int, error) {
	// Get total count
	var total int
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM products").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, name, description, price, stock, photo_url, created_at, updated_at
		FROM products
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	metrics.ProductDBQueriesTotal.WithLabelValues("select_all").Inc()
	defer rows.Close()

	var products []*model.Product
	for rows.Next() {
		var p model.Product
		var photoURL *string
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &photoURL, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		if photoURL != nil {
			p.PhotoURL = *photoURL
		}
		products = append(products, &p)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *PostgresProductRepository) GetProductByID(ctx context.Context, id string) (*model.Product, error) {
	query := `
		SELECT id, name, description, price, stock, photo_url, created_at, updated_at
		FROM products
		WHERE id = $1
	`
	var p model.Product
	var photoURL *string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &photoURL, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	metrics.ProductDBQueriesTotal.WithLabelValues("select_one").Inc()
	if photoURL != nil {
		p.PhotoURL = *photoURL
	}
	return &p, nil
}

func (r *PostgresProductRepository) CreateProduct(ctx context.Context, p *model.Product) error {
	query := `
		INSERT INTO products (name, description, price, stock, photo_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	var photoURL *string
	if p.PhotoURL != "" {
		photoURL = &p.PhotoURL
	}
	err := r.db.QueryRow(ctx, query, p.Name, p.Description, p.Price, p.Stock, photoURL).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	return err
}

func (r *PostgresProductRepository) UpdateProduct(ctx context.Context, p *model.Product) error {
	query := `
		UPDATE products
		SET name = $1, description = $2, price = $3, stock = $4, photo_url = $5, updated_at = $6
		WHERE id = $7
	`
	p.UpdatedAt = time.Now()
	var photoURL *string
	if p.PhotoURL != "" {
		photoURL = &p.PhotoURL
	}
	
	cmdTag, err := r.db.Exec(ctx, query, p.Name, p.Description, p.Price, p.Stock, photoURL, p.UpdatedAt, p.ID)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (r *PostgresProductRepository) DeleteProduct(ctx context.Context, id string) error {
	query := "DELETE FROM products WHERE id = $1"
	cmdTag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrProductNotFound
	}
	return nil
}
