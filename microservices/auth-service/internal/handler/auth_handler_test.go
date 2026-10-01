package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/internal/handler"
	"auth-service/internal/middleware"
	"auth-service/internal/model"
	"auth-service/internal/repository"
	"auth-service/internal/service"
)

const testJWTSecret = "handler-test-secret-key-12345"

func setupHandlerTest() (*handler.AuthHandler, *service.AuthService, *repository.MockUserRepository) {
	repo := repository.NewMockUserRepository()
	authSvc := service.NewAuthService(repo, testJWTSecret)
	h := handler.NewAuthHandler(authSvc)
	return h, authSvc, repo
}

func TestAuthHandler_HandleRegister(t *testing.T) {
	h, _, _ := setupHandlerTest()

	t.Run("success", func(t *testing.T) {
		body := `{"name":"Bob","email":"bob@example.com","password":"password123"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleRegister(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
		}

		var resp handler.APIResponse
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if !resp.Success {
			t.Errorf("expected success: true")
		}
	})

	t.Run("duplicate email returns 409", func(t *testing.T) {
		body := `{"name":"Bob","email":"bob@example.com","password":"password123"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleRegister(w, req)
		if w.Code != http.StatusConflict {
			t.Fatalf("expected status 409, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("missing fields returns 400", func(t *testing.T) {
		body := `{"name":"","email":"test@example.com","password":""}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleRegister(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", w.Code)
		}
	})

	t.Run("malformed json returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString("invalid-json"))
		w := httptest.NewRecorder()

		h.HandleRegister(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", w.Code)
		}
	})
}

func TestAuthHandler_HandleLogin(t *testing.T) {
	h, authSvc, _ := setupHandlerTest()

	// Setup a user
	_, _, err := authSvc.Register(context.Background(), &model.RegisterRequest{
		Name:     "Test User",
		Email:    "login@example.com",
		Password: "correctpassword",
	})
	if err != nil {
		t.Fatalf("setup user failed: %v", err)
	}

	t.Run("success", func(t *testing.T) {
		body := `{"email":"login@example.com","password":"correctpassword"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleLogin(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d: %s", w.Code, w.Body.String())
		}

		var resp handler.APIResponse
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if !resp.Success {
			t.Errorf("expected success: true")
		}
	})

	t.Run("invalid credentials returns 401", func(t *testing.T) {
		body := `{"email":"login@example.com","password":"wrongpassword"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleLogin(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", w.Code)
		}
	})

	t.Run("missing fields returns 400", func(t *testing.T) {
		body := `{"email":"","password":""}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleLogin(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", w.Code)
		}
	})
}

func TestAuthHandler_HandleLogout(t *testing.T) {
	h, _, _ := setupHandlerTest()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
	w := httptest.NewRecorder()

	h.HandleLogout(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
}

func TestAuthHandler_HandleMe(t *testing.T) {
	h, authSvc, _ := setupHandlerTest()

	// Register user
	_, user, err := authSvc.Register(context.Background(), &model.RegisterRequest{
		Name:     "Profile User",
		Email:    "profile@example.com",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	t.Run("authenticated success", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, user.ID)
		req = req.WithContext(ctx)
		w := httptest.NewRecorder()

		h.HandleMe(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("unauthenticated context returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		w := httptest.NewRecorder()

		h.HandleMe(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", w.Code)
		}
	})

	t.Run("user not found returns 404", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "nonexistent-id")
		req = req.WithContext(ctx)
		w := httptest.NewRecorder()

		h.HandleMe(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected status 404, got %d", w.Code)
		}
	})
}

func TestAuthHandler_HandleValidate(t *testing.T) {
	h, authSvc, _ := setupHandlerTest()

	token, _, err := authSvc.Register(context.Background(), &model.RegisterRequest{
		Name:     "Valid User",
		Email:    "valid@example.com",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	t.Run("validate with Authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/validate", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()

		h.HandleValidate(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("validate with body token", func(t *testing.T) {
		body := `{"token":"` + token + `"}`
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/validate", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleValidate(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("validate missing token returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/validate", bytes.NewBufferString(`{}`))
		w := httptest.NewRecorder()

		h.HandleValidate(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", w.Code)
		}
	})

	t.Run("validate invalid token returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/validate", nil)
		req.Header.Set("Authorization", "Bearer invalid-token-string")
		w := httptest.NewRecorder()

		h.HandleValidate(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", w.Code)
		}
	})
}

func TestAuthHandler_HandleCreateAdmin(t *testing.T) {
	h, _, _ := setupHandlerTest()

	t.Run("success", func(t *testing.T) {
		body := `{"name":"Admin Master","email":"master@example.com","password":"secretadminpass"}`
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/admin", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleCreateAdmin(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("duplicate admin email returns 409", func(t *testing.T) {
		body := `{"name":"Admin Master","email":"master@example.com","password":"secretadminpass"}`
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/admin", bytes.NewBufferString(body))
		w := httptest.NewRecorder()

		h.HandleCreateAdmin(w, req)
		if w.Code != http.StatusConflict {
			t.Fatalf("expected status 409, got %d", w.Code)
		}
	})
}
