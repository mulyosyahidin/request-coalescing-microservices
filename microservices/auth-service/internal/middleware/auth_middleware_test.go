package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"auth-service/internal/middleware"
)

const testSecret = "middleware-test-secret-key"

func TestAuthMiddleware(t *testing.T) {
	generateToken := func(sub, email, role string, exp time.Duration) string {
		claims := jwt.MapClaims{
			"sub":   sub,
			"email": email,
			"role":  role,
			"exp":   time.Now().Add(exp).Unix(),
			"iat":   time.Now().Unix(),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenStr, _ := token.SignedString([]byte(testSecret))
		return tokenStr
	}

	t.Run("missing authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		w := httptest.NewRecorder()

		handler := middleware.AuthMiddleware(testSecret)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("invalid token format", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "NotBearer some-token")
		w := httptest.NewRecorder()

		handler := middleware.AuthMiddleware(testSecret)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("invalid token secret", func(t *testing.T) {
		claims := jwt.MapClaims{
			"sub":   "user-1",
			"email": "user@example.com",
			"role":  "customer",
			"exp":   time.Now().Add(time.Hour).Unix(),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenStr, _ := token.SignedString([]byte("wrong-secret"))

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		w := httptest.NewRecorder()

		handler := middleware.AuthMiddleware(testSecret)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("valid token injects context", func(t *testing.T) {
		tokenStr := generateToken("user-555", "test@domain.com", "customer", time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		w := httptest.NewRecorder()

		var extractedUserID, extractedEmail, extractedRole interface{}

		handler := middleware.AuthMiddleware(testSecret)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			extractedUserID = r.Context().Value(middleware.UserIDKey)
			extractedEmail = r.Context().Value(middleware.UserEmailKey)
			extractedRole = r.Context().Value(middleware.UserRoleKey)
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
		if extractedUserID != "user-555" {
			t.Errorf("expected user ID 'user-555', got %v", extractedUserID)
		}
		if extractedEmail != "test@domain.com" {
			t.Errorf("expected email 'test@domain.com', got %v", extractedEmail)
		}
		if extractedRole != "customer" {
			t.Errorf("expected role 'customer', got %v", extractedRole)
		}
	})
}
