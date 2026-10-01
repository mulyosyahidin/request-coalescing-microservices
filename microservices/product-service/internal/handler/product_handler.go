package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"product-service/internal/model"
	"product-service/internal/repository"
	"product-service/internal/service"
	"product-service/internal/storage"
)

type ProductHandler struct {
	svc       service.ProductService
	s3Storage *storage.S3Storage
}

func NewProductHandler(svc service.ProductService, s3 *storage.S3Storage) *ProductHandler {
	return &ProductHandler{
		svc:       svc,
		s3Storage: s3,
	}
}

func (h *ProductHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 20
	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
		limit = l
	}

	offset := (page - 1) * limit

	products, total, err := h.svc.GetProducts(r.Context(), limit, offset)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Products retrieved", map[string]interface{}{
		"items": products,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *ProductHandler) GetProductByIDCoalescing(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Missing product ID")
		return
	}

	if _, err := uuid.Parse(id); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Product ID must be a valid UUID")
		return
	}

	p, err := h.svc.GetProductByIDWithCoalescing(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Product not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Product retrieved (coalesced)", p)
}

func (h *ProductHandler) GetProductByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Missing product ID")
		return
	}

	if _, err := uuid.Parse(id); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Product ID must be a valid UUID")
		return
	}

	p, err := h.svc.GetProductByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Product not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Product retrieved", p)
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req model.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid JSON body")
		return
	}

	if req.Name == "" || req.Price < 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid name or price")
		return
	}

	p, err := h.svc.CreateProduct(r.Context(), &req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusCreated, "Product created", p)
}

func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Missing product ID")
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Product ID must be a valid UUID")
		return
	}

	var req model.UpdateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid JSON body")
		return
	}

	p, err := h.svc.UpdateProduct(r.Context(), id, &req)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Product not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Product updated", p)
}

func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Missing product ID")
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Product ID must be a valid UUID")
		return
	}

	err := h.svc.DeleteProduct(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Product not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Product deleted", nil)
}

func (h *ProductHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form, max 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		if errors.Is(err, http.ErrNotMultipart) {
			RespondError(w, http.StatusBadRequest, "INVALID_CONTENT_TYPE", "Request must be multipart/form-data")
			return
		}
		RespondError(w, http.StatusBadRequest, "FORM_PARSE_ERROR", "Failed to parse form. File might be too large (Max 10MB)")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			RespondError(w, http.StatusBadRequest, "MISSING_FILE", "A file must be provided in the 'image' field")
			return
		}
		RespondError(w, http.StatusBadRequest, "FILE_ERROR", "Error reading the uploaded file")
		return
	}
	defer file.Close()

	contentType := header.Header.Get("Content-Type")

	objectKey, err := h.s3Storage.UploadPhoto(r.Context(), file, header.Filename, contentType)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPLOAD_FAILED", err.Error())
		return
	}

	RespondSuccess(w, http.StatusOK, "Photo uploaded successfully", map[string]string{
		"photo_url": objectKey,
	})
}

func (h *ProductHandler) HandleSeed(w http.ResponseWriter, r *http.Request) {
	// Simple seed for 50 products
	for i := 1; i <= 50; i++ {
		desc := "Seeded product description"
		p := &model.CreateProductRequest{
			Name:        "Product " + strconv.Itoa(i),
			Description: &desc,
			Price:       float64(100 + (i * 5)),
			Stock:       50,
			PhotoURL:    "https://picsum.photos/400/400?random=" + strconv.Itoa(i), // External URL bypasses S3 signing
		}
		_, err := h.svc.CreateProduct(r.Context(), p)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "SEED_ERROR", err.Error())
			return
		}
	}
	RespondSuccess(w, http.StatusCreated, "50 products seeded successfully", nil)
}
