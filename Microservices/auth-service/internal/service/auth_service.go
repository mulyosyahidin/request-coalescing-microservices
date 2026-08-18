package service

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"auth-service/internal/model"
	"auth-service/internal/repository"
)

var (
	ErrUserExists    = errors.New("user already exists")
	ErrInvalidCreds  = errors.New("invalid credentials")
	ErrUserNotFound  = errors.New("user not found")
)

type AuthService struct {
	repo      *repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) generateToken(user *model.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	})

	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) Register(ctx context.Context, req *model.RegisterRequest) (string, *model.User, error) {
	// Check if user exists
	existing, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return "", nil, err
	}
	if existing != nil {
		return "", nil, ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", nil, err
	}

	user := &model.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         "customer", // Default role
	}

	err = s.repo.CreateUser(ctx, user)
	if err != nil {
		return "", nil, err
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (string, *model.User, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return "", nil, err
	}
	if user == nil {
		return "", nil, ErrInvalidCreds
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return "", nil, ErrInvalidCreds
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	user, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}
