package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"auth-service/internal/middleware"
	"auth-service/internal/model"
	"auth-service/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST_BODY", "Malformed JSON request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Name == "" || req.Email == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Name, email, and password are required")
		return
	}

	token, user, err := h.authService.Register(r.Context(), &req)
	if err != nil {
		if err == service.ErrUserExists {
			RespondError(w, http.StatusConflict, "USER_ALREADY_EXISTS", "User with this email already exists")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to register user")
		return
	}

	resp := model.AuthResponse{
		Token: token,
		User:  *user,
	}

	RespondSuccess(w, http.StatusCreated, "User registered successfully", resp)
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST_BODY", "Malformed JSON request body")
		return
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Email and password are required")
		return
	}

	token, user, err := h.authService.Login(r.Context(), &req)
	if err != nil {
		if err == service.ErrInvalidCreds {
			RespondError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to authenticate")
		return
	}

	resp := model.AuthResponse{
		Token: token,
		User:  *user,
	}

	RespondSuccess(w, http.StatusOK, "Login successful", resp)
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Stateless JWT: logout is confirmed via 200 JSON, client drops token
	RespondSuccess(w, http.StatusOK, "Logged out successfully", map[string]interface{}{})
}

func (h *AuthHandler) HandleMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing or invalid authentication context")
		return
	}

	user, err := h.authService.GetUserByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to retrieve user profile")
		return
	}
	if user == nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
		return
	}

	RespondSuccess(w, http.StatusOK, "User profile retrieved successfully", user)
}

func (h *AuthHandler) HandleValidate(w http.ResponseWriter, r *http.Request) {
	var tokenStr string
	// Support token in request body or Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenStr = parts[1]
		}
	}

	if tokenStr == "" && r.Body != nil {
		var req model.ValidateTokenRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err == nil {
			tokenStr = req.Token
		}
	}

	if tokenStr == "" {
		RespondError(w, http.StatusBadRequest, "MISSING_TOKEN", "Token is required in body or Authorization header")
		return
	}

	claims, err := h.authService.ValidateToken(tokenStr)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "INVALID_TOKEN", "Token is invalid or expired")
		return
	}

	RespondSuccess(w, http.StatusOK, "Token is valid", claims)
}

func (h *AuthHandler) HandleCreateAdmin(w http.ResponseWriter, r *http.Request) {
	var req model.CreateAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST_BODY", "Malformed JSON request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Name == "" || req.Email == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Name, email, and password are required")
		return
	}

	token, user, err := h.authService.CreateAdmin(r.Context(), &req)
	if err != nil {
		if err == service.ErrUserExists {
			RespondError(w, http.StatusConflict, "USER_ALREADY_EXISTS", "User with this email already exists")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to create admin user")
		return
	}

	resp := model.AuthResponse{
		Token: token,
		User:  *user,
	}

	RespondSuccess(w, http.StatusCreated, "Admin user created successfully", resp)
}
