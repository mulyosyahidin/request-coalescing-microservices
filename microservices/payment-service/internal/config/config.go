package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	Environment       string
	LogLevel          string
	DatabaseURL       string
	JWTSecret         string
	OrderServiceURL   string
	MidtransServerKey string
	MidtransClientKey string
	MidtransEnv       string
	FrontendURL       string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using OS environment variables")
	}

	return &Config{
		Port:              getEnv("PORT", "8080"),
		Environment:       getEnv("ENVIRONMENT", "development"),
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		DatabaseURL:       getEnv("DATABASE_URL", "postgres://payment_user:payment_password_secure@localhost:5436/payment_db?sslmode=disable"),
		JWTSecret:         getEnv("JWT_SECRET", "secret"),
		OrderServiceURL:   getEnv("ORDER_SERVICE_URL", "http://order-service:8080"),
		MidtransServerKey: getEnv("MIDTRANS_SERVER_KEY", "SB-Mid-server-xxx"),
		MidtransClientKey: getEnv("MIDTRANS_CLIENT_KEY", "SB-Mid-client-xxx"),
		MidtransEnv:       getEnv("MIDTRANS_ENV", "sandbox"),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
