package repository

import (
	"context"

	"github.com/swimplan/backend/internal/model"
)

// UpsertUser creates or updates a user from an OAuth provider.
// Returns the user (existing or newly created).
func (r *Repo) UpsertUser(ctx context.Context, email, name, provider, providerID, avatarURL string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO users (email, name, provider, provider_id, avatar_url)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (provider, provider_id) DO UPDATE
		SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = now()
		RETURNING id, email, name, provider, provider_id, avatar_url, created_at, updated_at`,
		email, name, provider, providerID, avatarURL).
		Scan(&u.ID, &u.Email, &u.Name, &u.Provider, &u.ProviderID, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByID returns a user by ID.
func (r *Repo) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `
		SELECT id, email, name, provider, provider_id, avatar_url, created_at, updated_at
		FROM users WHERE id = $1`, id).
		Scan(&u.ID, &u.Email, &u.Name, &u.Provider, &u.ProviderID, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
