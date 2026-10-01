package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"auth-service/internal/handler"
	authmiddleware "auth-service/internal/middleware"
	"auth-service/internal/model"
	"auth-service/internal/repository"
	"auth-service/internal/service"
)

func setupTestRouter(jwtSecret string) (http.Handler, *repository.MockUserRepository) {
	repo := repository.NewMockUserRepository()
	authService := service.NewAuthService(repo, jwtSecret)
	authHandler := handler.NewAuthHandler(authService)

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(authmiddleware.CORSMiddleware)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handler.RespondSuccess(w, http.StatusOK, "Hello World from Auth Service", map[string]string{
			"service": "auth-service",
			"status":  "ok",
		})
	})
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		handler.RespondSuccess(w, http.StatusOK, "Service is healthy", map[string]string{
			"status":  "up",
			"service": "auth-service",
		})
	})

	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.HandleRegister)
		r.Post("/login", authHandler.HandleLogin)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authmiddleware.AuthMiddleware(jwtSecret))
			r.Post("/logout", authHandler.HandleLogout)
			r.Get("/me", authHandler.HandleMe)
		})
	})

	r.Route("/internal/auth", func(r chi.Router) {
		r.Post("/validate", authHandler.HandleValidate)
		r.Post("/admin", authHandler.HandleCreateAdmin)
	})

	return r, repo
}

func TestAuthService_FullIntegrationFlow(t *testing.T) {
	const secret = "integration-test-secret"
	router, _ := setupTestRouter(secret)

	// 1. Check health
	{
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("health check failed with status: %d", w.Code)
		}
	}

	// 2. Register a customer
	var customerToken string
	var customerID string
	{
		body := `{"name":"Customer One","email":"cust1@example.com","password":"mypassword123"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("registration failed with status: %d, body: %s", w.Code, w.Body.String())
		}

		var resp struct {
			Success bool               `json:"success"`
			Message string             `json:"message"`
			Data    model.AuthResponse `json:"data"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if !resp.Success {
			t.Fatalf("expected success: true")
		}
		if resp.Data.User.Role != "customer" {
			t.Errorf("expected role 'customer', got %s", resp.Data.User.Role)
		}
		customerToken = resp.Data.Token
		customerID = resp.Data.User.ID
	}

	// 3. Login with the registered customer
	{
		body := `{"email":"cust1@example.com","password":"mypassword123"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("login failed with status: %d, body: %s", w.Code, w.Body.String())
		}
	}

	// 4. Access protected /api/v1/auth/me with Bearer token
	{
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("/me failed with status: %d, body: %s", w.Code, w.Body.String())
		}

		var resp struct {
			Success bool       `json:"success"`
			Message string     `json:"message"`
			Data    model.User `json:"data"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if resp.Data.ID != customerID {
			t.Errorf("expected user ID %s, got %s", customerID, resp.Data.ID)
		}
	}

	// 5. Access /api/v1/auth/me without token -> should return 401
	{
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401 unauthorized, got %d", w.Code)
		}
	}

	// 6. Validate token via internal endpoint
	{
		body := `{"token":"` + customerToken + `"}`
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/validate", bytes.NewBufferString(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("validate failed with status: %d", w.Code)
		}

		var resp struct {
			Success bool                        `json:"success"`
			Data    model.ValidateTokenResponse `json:"data"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if resp.Data.Role != "customer" || resp.Data.UserID != customerID {
			t.Errorf("unexpected validation response: %+v", resp.Data)
		}
	}

	// 7. Create admin via internal endpoint
	{
		body := `{"name":"Super Admin","email":"admin@store.com","password":"securepassword123"}`
		req := httptest.NewRequest(http.MethodPost, "/internal/auth/admin", bytes.NewBufferString(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("admin creation failed with status: %d", w.Code)
		}

		var resp struct {
			Success bool               `json:"success"`
			Data    model.AuthResponse `json:"data"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if resp.Data.User.Role != "admin" {
			t.Errorf("expected role 'admin', got %s", resp.Data.User.Role)
		}
	}

	// 8. Logout
	{
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
		req.Header.Set("Authorization", "Bearer "+customerToken)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("logout failed with status: %d", w.Code)
		}
	}
}
