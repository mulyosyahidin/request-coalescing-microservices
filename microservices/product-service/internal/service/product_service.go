package service

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"

	"product-service/internal/metrics"
	"product-service/internal/model"
	"product-service/internal/repository"
	"product-service/internal/storage"
)

type ProductService interface {
	GetProducts(ctx context.Context, limit, offset int) ([]*model.Product, int, error)
	GetProductByID(ctx context.Context, id string) (*model.Product, error)
	GetProductByIDWithCoalescing(ctx context.Context, id string) (*model.Product, error)
	CreateProduct(ctx context.Context, req *model.CreateProductRequest) (*model.Product, error)
	UpdateProduct(ctx context.Context, id string, req *model.UpdateProductRequest) (*model.Product, error)
	DeleteProduct(ctx context.Context, id string) error
	InvalidateCache(id string)
}

type productServiceImpl struct {
	repo      repository.ProductRepository
	s3Storage *storage.S3Storage
	
	// Singleflight group for request coalescing at Go level
	sg singleflight.Group

	// Simple in-memory cache for hot keys (coalescing experiments)
	// Key: product ID (string), Value: *model.Product
	cache sync.Map
}

func NewProductService(repo repository.ProductRepository, s3 *storage.S3Storage) ProductService {
	return &productServiceImpl{
		repo:      repo,
		s3Storage: s3,
	}
}

// mapS3URL is a helper to sign photo_urls for clients
func (s *productServiceImpl) mapS3URL(ctx context.Context, p *model.Product) {
	if p.PhotoURL != "" {
		signedURL, err := s.s3Storage.GeneratePresignedURL(ctx, p.PhotoURL)
		if err == nil {
			p.PhotoURL = signedURL
		} else {
			slog.Error("Failed to sign S3 URL", "product_id", p.ID, "err", err)
		}
	}
}

func (s *productServiceImpl) GetProducts(ctx context.Context, limit, offset int) ([]*model.Product, int, error) {
	// Not caching lists for now to keep it simple, only caching single products
	products, total, err := s.repo.GetProducts(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// Sign URLs
	for _, p := range products {
		s.mapS3URL(ctx, p)
	}

	return products, total, nil
}

func (s *productServiceImpl) GetProductByID(ctx context.Context, id string) (*model.Product, error) {
	// 1. (CACHE DISABLED FOR LOAD TESTING)
	// if cachedVal, ok := s.cache.Load(id); ok {
	// 	p := cachedVal.(*model.Product)
	// 	pCopy := *p
	// 	s.mapS3URL(ctx, &pCopy) // Sign URL on the fly
	// 	slog.Debug("Cache hit for product", "id", id)
	// 	metrics.ProductCacheHitsTotal.Inc()
	// 	return &pCopy, nil
	// }

	// 2. Fetch from DB
	slog.Debug("Cache miss for product", "id", id)
	metrics.ProductCacheMissesTotal.Inc()
	p, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// 3. Save to cache (DISABLED FOR LOAD TESTING)
	// pCache := *p
	// s.cache.Store(id, &pCache)

	// 4. Return signed version
	s.mapS3URL(ctx, p)
	return p, nil
}

func (s *productServiceImpl) CreateProduct(ctx context.Context, req *model.CreateProductRequest) (*model.Product, error) {
	p := &model.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		PhotoURL:    req.PhotoURL, // Contains the S3 Object Key
	}

	err := s.repo.CreateProduct(ctx, p)
	if err != nil {
		return nil, err
	}

	// Return a copy with signed URL
	pReturn := *p
	s.mapS3URL(ctx, &pReturn)
	return &pReturn, nil
}

func (s *productServiceImpl) UpdateProduct(ctx context.Context, id string, req *model.UpdateProductRequest) (*model.Product, error) {
	p, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, err
	}

	p.Name = req.Name
	p.Description = req.Description
	p.Price = req.Price
	p.Stock = req.Stock
	p.PhotoURL = req.PhotoURL
	p.UpdatedAt = time.Now()

	err = s.repo.UpdateProduct(ctx, p)
	if err != nil {
		return nil, err
	}

	// Invalidate cache since it changed
	s.InvalidateCache(id)

	// Return a copy with signed URL
	pReturn := *p
	s.mapS3URL(ctx, &pReturn)
	return &pReturn, nil
}

func (s *productServiceImpl) DeleteProduct(ctx context.Context, id string) error {
	err := s.repo.DeleteProduct(ctx, id)
	if err != nil {
		return err
	}
	s.InvalidateCache(id)
	return nil
}

func (s *productServiceImpl) InvalidateCache(id string) {
	s.cache.Delete(id)
	slog.Info("Product cache invalidated", "id", id)
}

func (s *productServiceImpl) GetProductByIDWithCoalescing(ctx context.Context, id string) (*model.Product, error) {
	// Use singleflight to coalesce concurrent requests for the same product ID
	key := "product_coalesce_" + id
	
	v, err, shared := s.sg.Do(key, func() (interface{}, error) {
		slog.Debug("Singleflight executed DB query", "id", id)
		
		// SIMULASI QUERY BERAT: 
		// Kita tahan eksekusinya selama 500 milidetik.
		// Ini memberi waktu bagi request-request lain dari K6 untuk "menumpuk" 
		// dan digabungkan (coalesced) oleh singleflight.
		time.Sleep(500 * time.Millisecond)
		
		p, err := s.repo.GetProductByID(ctx, id)
		if err != nil {
			return nil, err
		}
		
		return p, nil
	})

	if err != nil {
		return nil, err
	}

	if shared {
		slog.Debug("Singleflight coalesced request", "id", id)
	}

	p := v.(*model.Product)
	
	// Create a copy so concurrent readers don't mutate the same object when signing URL
	pCopy := *p
	s.mapS3URL(ctx, &pCopy)

	return &pCopy, nil
}
