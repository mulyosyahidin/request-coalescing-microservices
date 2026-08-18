package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey    contextKey = "user_id"
	UserRoleKey  contextKey = "user_role"
	UserEmailKey contextKey = "user_email"
)

func respondJSONError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"message": message,
		"error": map[string]string{
			"code": code,
		},
	})
}

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				respondJSONError(w, http.StatusUnauthorized, "MISSING_TOKEN", "Authorization header is missing")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				respondJSONError(w, http.StatusUnauthorized, "INVALID_TOKEN_FORMAT", "Authorization header format must be Bearer <token>")
				return
			}

			tokenStr := parts[1]
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, http.ErrAbortHandler
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				respondJSONError(w, http.StatusUnauthorized, "INVALID_TOKEN", "Token is invalid or expired")
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				respondJSONError(w, http.StatusUnauthorized, "INVALID_CLAIMS", "Invalid token claims")
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, claims["sub"])
			ctx = context.WithValue(ctx, UserRoleKey, claims["role"])
			ctx = context.WithValue(ctx, UserEmailKey, claims["email"])

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
