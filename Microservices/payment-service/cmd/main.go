package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/cors"

	"payment-service/internal/config"
	"payment-service/internal/handler"
	"payment-service/internal/middleware"
	"payment-service/internal/repository"
	"payment-service/internal/service"
)

var (
	ServiceName = "payment-service"
	Version     = "1.0.0"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg := config.LoadConfig()

	ctx := context.Background()

	// Connect Database
	dbpool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("Unable to create connection pool", "err", err)
		os.Exit(1)
	}
	defer dbpool.Close()

	if err := dbpool.Ping(ctx); err != nil {
		slog.Error("Unable to ping database", "err", err)
		os.Exit(1)
	}
	slog.Info("Connected to database")

	// Init layers
	paymentRepo := repository.NewPaymentRepository(dbpool)
	paymentService := service.NewPaymentService(paymentRepo, cfg)
	paymentHandler := handler.NewPaymentHandler(paymentService)

	// Router
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(corsMiddleware.Handler)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		handler.RespondSuccess(w, http.StatusOK, "Service is healthy", map[string]string{
			"status":  "up",
			"service": ServiceName,
		})
	})
	r.Handle("/metrics", promhttp.Handler())

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handler.RespondSuccess(w, http.StatusOK, "Hello World from Payment Service", map[string]string{
			"service": ServiceName,
			"status":  "ok",
		})
	})

	// API Routes
	r.Route("/api/v1/payments", func(r chi.Router) {
		// Public Webhook from Midtrans
		r.Post("/notification", paymentHandler.HandleNotification)
		
		// Protected Endpoints
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Post("/", paymentHandler.CreatePayment)
			r.Get("/order/{orderId}", paymentHandler.GetPaymentByOrderID)
		})
	})

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		slog.Info("Starting server", "port", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", "err", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")
	ctxShutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctxShutdown); err != nil {
		slog.Error("Server forced to shutdown", "err", err)
	}
	slog.Info("Server exiting")
}
