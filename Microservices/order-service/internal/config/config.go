package config

import (
	"log/slog"
	"os"
)

type Config struct {
	Port               string
	DatabaseURL        string
	JWTSecret          string
	ProductServiceURL  string
	PaymentServiceURL  string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		slog.Warn("DATABASE_URL is not set")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		slog.Warn("JWT_SECRET is not set")
	}

	productURL := os.Getenv("PRODUCT_SERVICE_URL")
	if productURL == "" {
		productURL = "http://product-service:8080"
		slog.Warn("PRODUCT_SERVICE_URL is not set, using default", "default", productURL)
	}

	paymentURL := os.Getenv("PAYMENT_SERVICE_URL")
	if paymentURL == "" {
		paymentURL = "http://payment-service:8080"
		slog.Warn("PAYMENT_SERVICE_URL is not set, using default", "default", paymentURL)
	}

	return &Config{
		Port:              port,
		DatabaseURL:       dbURL,
		JWTSecret:         jwtSecret,
		ProductServiceURL: productURL,
		PaymentServiceURL: paymentURL,
	}
}
