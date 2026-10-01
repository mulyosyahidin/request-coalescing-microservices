package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"auth-service/internal/model"
	"auth-service/internal/repository"
	"auth-service/internal/service"
)

const testJWTSecret = "test-super-secret-key-12345"

func TestAuthService_Register(t *testing.T) {
	ctx := context.Background()

	t.Run("success customer registration", func(t *testing.T) {
		repo := repository.NewMockUserRepository()
		authSvc := service.NewAuthService(repo, testJWTSecret)

		req := &model.RegisterRequest{
			Name:     "Alice Smith",
			Email:    "alice@example.com",
			Password: "password123",
		}

		token, user, err := authSvc.Register(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if token == "" {
			t.Errorf("expected non-empty token")
		}
		if user == nil {
			t.Fatalf("expected non-nil user")
		}
		if user.Email != "alice@example.com" {
			t.Errorf("expected email alice@example.com, got %s", user.Email)
		}
		if user.Role != "customer" {
			t.Errorf("expected default role 'customer', got %s", user.Role)
		}

		// Verify password was hashed
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("password123")); err != nil {
			t.Errorf("password hash verification failed: %v", err)
		}

		// Verify claims in returned token
		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			t.Fatalf("token validation failed: %v", err)
		}
		if claims.UserID != user.ID || claims.Role != "customer" || claims.Email != "alice@example.com" {
			t.Errorf("claims mismatch: %+v", claims)
		}
	})

	t.Run("duplicate email returns ErrUserExists", func(t *testing.T) {
		repo := repository.NewMockUserRepository()
		authSvc := service.NewAuthService(repo, testJWTSecret)

		req := &model.RegisterRequest{
			Name:     "Alice",
			Email:    "alice@example.com",
			Password: "password123",
		}

		_, _, err := authSvc.Register(ctx, req)
		if err != nil {
			t.Fatalf("first registration failed: %v", err)
		}

		_, _, err = authSvc.Register(ctx, req)
		if !errors.Is(err, service.ErrUserExists) {
			t.Errorf("expected ErrUserExists, got %v", err)
		}
	})

	t.Run("database error returns error", func(t *testing.T) {
		repo := repository.NewMockUserRepository()
		repo.ShouldFail = errors.New("db down")
		authSvc := service.NewAuthService(repo, testJWTSecret)

		req := &model.RegisterRequest{
			Name:     "Alice",
			Email:    "alice@example.com",
			Password: "password123",
		}

		_, _, err := authSvc.Register(ctx, req)
		if err == nil {
			t.Errorf("expected error, got nil")
		}
	})
}

func TestAuthService_CreateAdmin(t *testing.T) {
	ctx := context.Background()

	t.Run("success admin registration", func(t *testing.T) {
		repo := repository.NewMockUserRepository()
		authSvc := service.NewAuthService(repo, testJWTSecret)

		req := &model.CreateAdminRequest{
			Name:     "Admin User",
			Email:    "admin@example.com",
			Password: "adminpassword",
		}

		token, user, err := authSvc.CreateAdmin(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if user.Role != "admin" {
			t.Errorf("expected role 'admin', got %s", user.Role)
		}

		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			t.Fatalf("token validation failed: %v", err)
		}
		if claims.Role != "admin" {
			t.Errorf("expected role claim 'admin', got %s", claims.Role)
		}
	})

	t.Run("duplicate admin email returns ErrUserExists", func(t *testing.T) {
		repo := repository.NewMockUserRepository()
		authSvc := service.NewAuthService(repo, testJWTSecret)

		req := &model.CreateAdminRequest{
			Name:     "Admin User",
			Email:    "admin@example.com",
			Password: "adminpassword",
		}

		_, _, err := authSvc.CreateAdmin(ctx, req)
		if err != nil {
			t.Fatalf("first creation failed: %v", err)
		}

		_, _, err = authSvc.CreateAdmin(ctx, req)
		if !errors.Is(err, service.ErrUserExists) {
			t.Errorf("expected ErrUserExists, got %v", err)
		}
	})
}

func TestAuthService_Login(t *testing.T) {
	ctx := context.Background()

	repo := repository.NewMockUserRepository()
	authSvc := service.NewAuthService(repo, testJWTSecret)

	// Pre-register a user
	regReq := &model.RegisterRequest{
		Name:     "Bob Jones",
		Email:    "bob@example.com",
		Password: "correctpassword",
	}
	_, registeredUser, err := authSvc.Register(ctx, regReq)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	tests := []struct {
		name        string
		req         *model.LoginRequest
		expectedErr error
	}{
		{
			name: "successful login",
			req: &model.LoginRequest{
				Email:    "bob@example.com",
				Password: "correctpassword",
			},
			expectedErr: nil,
		},
		{
			name: "wrong password",
			req: &model.LoginRequest{
				Email:    "bob@example.com",
				Password: "wrongpassword",
			},
			expectedErr: service.ErrInvalidCreds,
		},
		{
			name: "user not found",
			req: &model.LoginRequest{
				Email:    "nonexistent@example.com",
				Password: "correctpassword",
			},
			expectedErr: service.ErrInvalidCreds,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, user, err := authSvc.Login(ctx, tt.req)
			if tt.expectedErr != nil {
				if !errors.Is(err, tt.expectedErr) {
					t.Errorf("expected error %v, got %v", tt.expectedErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if token == "" {
				t.Errorf("expected token, got empty")
			}
			if user.ID != registeredUser.ID {
				t.Errorf("expected user ID %s, got %s", registeredUser.ID, user.ID)
			}
		})
	}
}

func TestAuthService_ValidateToken(t *testing.T) {
	repo := repository.NewMockUserRepository()
	authSvc := service.NewAuthService(repo, testJWTSecret)

	t.Run("valid token", func(t *testing.T) {
		user := &model.User{
			ID:    "user-123",
			Email: "test@example.com",
			Role:  "customer",
		}
		token, err := authSvc.GenerateToken(user)
		if err != nil {
			t.Fatalf("failed to generate token: %v", err)
		}

		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			t.Fatalf("unexpected validation error: %v", err)
		}
		if claims.UserID != "user-123" || claims.Role != "customer" || claims.Email != "test@example.com" {
			t.Errorf("claims mismatch: %+v", claims)
		}
	})

	t.Run("invalid secret", func(t *testing.T) {
		otherAuthSvc := service.NewAuthService(repo, "different-secret-key")
		user := &model.User{
			ID:    "user-123",
			Email: "test@example.com",
			Role:  "customer",
		}
		token, _ := otherAuthSvc.GenerateToken(user)

		_, err := authSvc.ValidateToken(token)
		if !errors.Is(err, service.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken, got %v", err)
		}
	})

	t.Run("expired token", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":   "user-123",
			"email": "test@example.com",
			"role":  "customer",
			"exp":   time.Now().Add(-1 * time.Hour).Unix(),
			"iat":   time.Now().Add(-2 * time.Hour).Unix(),
		})
		tokenStr, _ := token.SignedString([]byte(testJWTSecret))

		_, err := authSvc.ValidateToken(tokenStr)
		if !errors.Is(err, service.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken for expired token, got %v", err)
		}
	})

	t.Run("malformed token", func(t *testing.T) {
		_, err := authSvc.ValidateToken("not.a.valid.jwt")
		if !errors.Is(err, service.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken for malformed token, got %v", err)
		}
	})

	t.Run("missing role in claims", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":   "user-123",
			"email": "test@example.com",
			"exp":   time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenStr, _ := token.SignedString([]byte(testJWTSecret))

		_, err := authSvc.ValidateToken(tokenStr)
		if !errors.Is(err, service.ErrMissingRole) {
			t.Errorf("expected ErrMissingRole, got %v", err)
		}
	})
}

func TestAuthService_GetUserByID(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewMockUserRepository()
	authSvc := service.NewAuthService(repo, testJWTSecret)

	regReq := &model.RegisterRequest{
		Name:     "Charlie",
		Email:    "charlie@example.com",
		Password: "password",
	}
	_, created, err := authSvc.Register(ctx, regReq)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	t.Run("found user", func(t *testing.T) {
		u, err := authSvc.GetUserByID(ctx, created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if u.ID != created.ID || u.Email != created.Email {
			t.Errorf("user mismatch: %+v", u)
		}
	})

	t.Run("user not found", func(t *testing.T) {
		_, err := authSvc.GetUserByID(ctx, "non-existent-id")
		if !errors.Is(err, service.ErrUserNotFound) {
			t.Errorf("expected ErrUserNotFound, got %v", err)
		}
	})
}
