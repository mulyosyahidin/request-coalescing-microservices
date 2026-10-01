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

	"product-service/internal/config"
	"product-service/internal/handler"
	"product-service/internal/middleware"
	"product-service/internal/repository"
	"product-service/internal/service"
	"product-service/internal/storage"
)

var (
	ServiceName = "product-service"
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

	// Init AWS S3
	s3Storage, err := storage.NewS3Storage(ctx, cfg.AWSRegion, cfg.AWSAccessKey, cfg.AWSSecretKey, cfg.S3BucketName, cfg.S3BaseURL)
	if err != nil {
		slog.Error("Unable to init S3 Storage", "err", err)
		os.Exit(1)
	}

	// Init layers
	productRepo := repository.NewProductRepository(dbpool)
	productService := service.NewProductService(productRepo, s3Storage)
	productHandler := handler.NewProductHandler(productService, s3Storage)

	// Router
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(corsMiddleware.Handler)

	r.Get("/health", handler.NewHealthHandler(ServiceName, dbpool))
	r.Handle("/metrics", promhttp.Handler())

	// Welcome Root Endpoint
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handler.RespondSuccess(w, http.StatusOK, "Hello World from Product Service", map[string]string{
			"service": ServiceName,
			"status":  "ok",
		})
	})

	// API Routes
	r.Route("/api/v1/products", func(r chi.Router) {
		// Public
		r.Get("/", productHandler.GetProducts)
		r.Get("/{id}", productHandler.GetProductByID)
		r.Get("/{id}/coalesced", productHandler.GetProductByIDCoalescing)

		// Admin Only
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Use(middleware.RequireRole("admin"))

			r.Post("/upload", productHandler.UploadPhoto)
			r.Post("/", productHandler.CreateProduct)
			r.Put("/{id}", productHandler.UpdateProduct)
			r.Delete("/{id}", productHandler.DeleteProduct)
		})
	})

	r.Route("/internal/products", func(r chi.Router) {
		r.Post("/seed", productHandler.HandleSeed)
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
