package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"

	"product-service/internal/handler"
)

type contextKey string

const (
	UserIDKey contextKey = "user_id"
	RoleKey   contextKey = "role"
)

// AuthMiddleware validates JWT and sets user info in context
func AuthMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				handler.RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing authorization header")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				handler.RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authorization header format")
				return
			}

			tokenStr := parts[1]
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				handler.RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid or expired token")
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				handler.RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token claims")
				return
			}

			// Validate mandatory role field per rule #11
			role, ok := claims["role"].(string)
			if !ok || role == "" {
				handler.RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Token missing mandatory role claim")
				return
			}

			userID, _ := claims["sub"].(string)

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, RoleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole ensures the user has a specific role (e.g. "admin")
func RequireRole(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(RoleKey).(string)
			if !ok || role != requiredRole {
				handler.RespondError(w, http.StatusForbidden, "FORBIDDEN", "You do not have permission to perform this action")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
