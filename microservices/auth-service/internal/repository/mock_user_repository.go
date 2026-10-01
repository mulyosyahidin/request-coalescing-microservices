package repository

import (
	"context"
	"errors"
	"sync"
	"time"

	"auth-service/internal/model"
)

// MockUserRepository is an in-memory implementation of UserRepository for unit testing.
type MockUserRepository struct {
	mu           sync.RWMutex
	users        map[string]*model.User // keyed by ID
	usersByEmail map[string]*model.User // keyed by Email
	ShouldFail   error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users:        make(map[string]*model.User),
		usersByEmail: make(map[string]*model.User),
	}
}

func (m *MockUserRepository) CreateUser(ctx context.Context, user *model.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.ShouldFail != nil {
		return m.ShouldFail
	}

	if _, exists := m.usersByEmail[user.Email]; exists {
		return errors.New("duplicate key value violates unique constraint")
	}

	if user.ID == "" {
		user.ID = "user-" + user.Email
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	uCopy := *user
	m.users[user.ID] = &uCopy
	m.usersByEmail[user.Email] = &uCopy
	return nil
}

func (m *MockUserRepository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.ShouldFail != nil {
		return nil, m.ShouldFail
	}

	u, exists := m.usersByEmail[email]
	if !exists {
		return nil, nil
	}
	uCopy := *u
	return &uCopy, nil
}

func (m *MockUserRepository) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.ShouldFail != nil {
		return nil, m.ShouldFail
	}

	u, exists := m.users[id]
	if !exists {
		return nil, nil
	}
	uCopy := *u
	return &uCopy, nil
}
