package handler

import (
	"context"
	"log/slog"
	"net/http"
	"time"
)

const healthCheckTimeout = time.Second

type DatabasePinger interface {
	Ping(context.Context) error
}

func NewHealthHandler(serviceName string, database DatabasePinger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), healthCheckTimeout)
		defer cancel()

		if err := database.Ping(ctx); err != nil {
			slog.Warn("Database health check failed", "service", serviceName, "err", err)
			RespondError(w, http.StatusServiceUnavailable, "DATABASE_UNAVAILABLE", "Service is not ready")
			return
		}

		RespondSuccess(w, http.StatusOK, "Service is healthy", map[string]string{
			"status":   "up",
			"service":  serviceName,
			"database": "up",
		})
	}
}
