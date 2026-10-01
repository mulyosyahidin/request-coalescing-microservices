package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type stubDatabasePinger struct {
	err error
}

func (s stubDatabasePinger) Ping(context.Context) error {
	return s.err
}

type healthResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Data    map[string]string `json:"data"`
	Error   struct {
		Code string `json:"code"`
	} `json:"error"`
}

func TestHealthHandler(t *testing.T) {
	tests := []struct {
		name           string
		databaseError  error
		expectedStatus int
		expectedBody   healthResponse
	}{
		{
			name:           "database is available",
			expectedStatus: http.StatusOK,
			expectedBody: healthResponse{
				Success: true,
				Message: "Service is healthy",
				Data: map[string]string{
					"status":   "up",
					"service":  "test-service",
					"database": "up",
				},
			},
		},
		{
			name:           "database is unavailable",
			databaseError:  errors.New("database unavailable"),
			expectedStatus: http.StatusServiceUnavailable,
			expectedBody: healthResponse{
				Success: false,
				Message: "Service is not ready",
				Error: struct {
					Code string `json:"code"`
				}{Code: "DATABASE_UNAVAILABLE"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodGet, "/health", nil)
			handler := NewHealthHandler("test-service", stubDatabasePinger{err: tt.databaseError})

			handler.ServeHTTP(recorder, request)

			if recorder.Code != tt.expectedStatus {
				t.Fatalf("expected status %d, got %d", tt.expectedStatus, recorder.Code)
			}
			if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
				t.Fatalf("expected application/json content type, got %q", contentType)
			}

			var response healthResponse
			if err := json.NewDecoder(recorder.Body).Decode(&response); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if response.Success != tt.expectedBody.Success {
				t.Errorf("expected success %t, got %t", tt.expectedBody.Success, response.Success)
			}
			if response.Message != tt.expectedBody.Message {
				t.Errorf("expected message %q, got %q", tt.expectedBody.Message, response.Message)
			}
			if response.Error.Code != tt.expectedBody.Error.Code {
				t.Errorf("expected error code %q, got %q", tt.expectedBody.Error.Code, response.Error.Code)
			}
			for key, expectedValue := range tt.expectedBody.Data {
				if actualValue := response.Data[key]; actualValue != expectedValue {
					t.Errorf("expected data[%q] %q, got %q", key, expectedValue, actualValue)
				}
			}
		})
	}
}
