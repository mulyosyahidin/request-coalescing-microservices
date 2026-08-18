package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"auth-service/internal/model"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, user.Name, user.Email, user.PasswordHash, user.Role).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	return err
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	var u model.User
	err := r.db.QueryRow(ctx, query, email).
		Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil // Not found
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var u model.User
	err := r.db.QueryRow(ctx, query, id).
		Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil // Not found
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
