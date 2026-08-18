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
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"auth-service/internal/config"
	"auth-service/internal/handler"
	authmiddleware "auth-service/internal/middleware"
	"auth-service/internal/repository"
	"auth-service/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg := config.LoadConfig()

	// Connect to Database
	ctx := context.Background()
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
	userRepo := repository.NewUserRepository(dbpool)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	authHandler := handler.NewAuthHandler(authService)

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

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
	r.Handle("/metrics", promhttp.Handler())

	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.HandleRegister)
		r.Post("/login", authHandler.HandleLogin)
		
		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authmiddleware.AuthMiddleware(cfg.JWTSecret))
			r.Post("/logout", authHandler.HandleLogout)
			r.Get("/me", authHandler.HandleMe)
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
