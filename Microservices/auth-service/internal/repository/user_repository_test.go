package repository_test

import (
	"context"
	"errors"
	"testing"

	"auth-service/internal/model"
	"auth-service/internal/repository"
)

func TestMockUserRepository(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewMockUserRepository()

	// Test CreateUser
	user := &model.User{
		Name:         "John Doe",
		Email:        "john@example.com",
		PasswordHash: "hashedpass",
		Role:         "customer",
	}

	err := repo.CreateUser(ctx, user)
	if err != nil {
		t.Fatalf("unexpected error creating user: %v", err)
	}
	if user.ID == "" {
		t.Errorf("expected user ID to be set, got empty")
	}

	// Test GetUserByEmail - Found
	found, err := repo.GetUserByEmail(ctx, "john@example.com")
	if err != nil {
		t.Fatalf("unexpected error getting user by email: %v", err)
	}
	if found == nil {
		t.Fatalf("expected user to be found, got nil")
	}
	if found.Email != "john@example.com" || found.Role != "customer" {
		t.Errorf("unexpected user data: %+v", found)
	}

	// Test GetUserByEmail - Not Found
	notFound, err := repo.GetUserByEmail(ctx, "unknown@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if notFound != nil {
		t.Errorf("expected nil for non-existent user, got %+v", notFound)
	}

	// Test GetUserByID - Found
	foundByID, err := repo.GetUserByID(ctx, user.ID)
	if err != nil {
		t.Fatalf("unexpected error getting user by ID: %v", err)
	}
	if foundByID == nil || foundByID.ID != user.ID {
		t.Errorf("expected user with ID %s, got %+v", user.ID, foundByID)
	}

	// Test GetUserByID - Not Found
	notFoundByID, err := repo.GetUserByID(ctx, "non-existent-id")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if notFoundByID != nil {
		t.Errorf("expected nil for non-existent user ID, got %+v", notFoundByID)
	}

	// Test ShouldFail error simulation
	customErr := errors.New("database connection failure")
	repo.ShouldFail = customErr

	err = repo.CreateUser(ctx, &model.User{Email: "fail@example.com"})
	if !errors.Is(err, customErr) {
		t.Errorf("expected customErr, got %v", err)
	}

	_, err = repo.GetUserByEmail(ctx, "john@example.com")
	if !errors.Is(err, customErr) {
		t.Errorf("expected customErr, got %v", err)
	}

	_, err = repo.GetUserByID(ctx, user.ID)
	if !errors.Is(err, customErr) {
		t.Errorf("expected customErr, got %v", err)
	}
}
