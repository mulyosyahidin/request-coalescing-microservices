package model

import (
	"time"
)

type Product struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	PhotoURL    string    `json:"photo_url"` // Stores the S3 Object Key in DB, returns Pre-Signed URL in JSON
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	PhotoURL    string  `json:"photo_url"` // S3 Object Key
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	PhotoURL    string  `json:"photo_url"`
}
