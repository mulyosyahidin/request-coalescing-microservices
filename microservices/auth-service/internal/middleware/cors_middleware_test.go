package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/internal/middleware"
)

func TestCORSMiddleware(t *testing.T) {
	t.Run("OPTIONS preflight request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodOptions, "/api/v1/auth/login", nil)
		w := httptest.NewRecorder()

		handler := middleware.CORSMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Errorf("expected status 204 for OPTIONS preflight, got %d", w.Code)
		}
		if w.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Errorf("expected Access-Control-Allow-Origin: *")
		}
		if w.Header().Get("Access-Control-Allow-Methods") == "" {
			t.Errorf("expected Access-Control-Allow-Methods header")
		}
	})

	t.Run("GET request headers", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		w := httptest.NewRecorder()

		handler := middleware.CORSMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", w.Code)
		}
		if w.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Errorf("expected Access-Control-Allow-Origin header")
		}
	})
}
