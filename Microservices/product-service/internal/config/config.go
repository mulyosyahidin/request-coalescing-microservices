package config

import (
	"log/slog"
	"os"
)

type Config struct {
	Port         string
	DatabaseURL  string
	JWTSecret    string
	AWSAccessKey string
	AWSSecretKey string
	AWSRegion    string
	S3BucketName string
	S3BaseURL    string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		slog.Warn("DATABASE_URL is not set")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		slog.Warn("JWT_SECRET is not set")
	}

	return &Config{
		Port:         port,
		DatabaseURL:  dbURL,
		JWTSecret:    jwtSecret,
		AWSAccessKey: os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		AWSRegion:    os.Getenv("AWS_REGION"),
		S3BucketName: os.Getenv("S3_BUCKET_NAME"),
		S3BaseURL:    os.Getenv("S3_BASE_URL"),
	}
}
