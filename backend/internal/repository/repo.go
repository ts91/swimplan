package repository

import (
	"context"
	"database/sql"

	"github.com/swimplan/backend/internal/model"
)

// Repo provides database access for the application.
type Repo struct {
	db *sql.DB
}

// New creates a new Repo.
func New(db *sql.DB) *Repo {
	return &Repo{db: db}
}

// ListExercises returns all exercises ordered by name.
func (r *Repo) ListExercises(ctx context.Context) ([]model.Exercise, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, category, phase, description, distance, created_at, updated_at
		FROM exercises ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Exercise
	for rows.Next() {
		var e model.Exercise
		if err := rows.Scan(&e.ID, &e.Name, &e.Category, &e.Phase, &e.Description, &e.Distance, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

// ListExercisesByPhase returns exercises for a given phase.
func (r *Repo) ListExercisesByPhase(ctx context.Context, phase string) ([]model.Exercise, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, category, phase, description, distance, created_at, updated_at
		FROM exercises WHERE phase = $1 ORDER BY name`, phase)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Exercise
	for rows.Next() {
		var e model.Exercise
		if err := rows.Scan(&e.ID, &e.Name, &e.Category, &e.Phase, &e.Description, &e.Distance, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

// GetExercise returns a single exercise by ID.
func (r *Repo) GetExercise(ctx context.Context, id string) (*model.Exercise, error) {
	var e model.Exercise
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, category, phase, description, distance, created_at, updated_at
		FROM exercises WHERE id = $1`, id).
		Scan(&e.ID, &e.Name, &e.Category, &e.Phase, &e.Description, &e.Distance, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

// CreateExercise inserts a new exercise and returns it.
func (r *Repo) CreateExercise(ctx context.Context, name, category, phase, description string, distance int) (*model.Exercise, error) {
	var e model.Exercise
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO exercises (name, category, phase, description, distance)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, category, phase, description, distance, created_at, updated_at`,
		name, category, phase, description, distance).
		Scan(&e.ID, &e.Name, &e.Category, &e.Phase, &e.Description, &e.Distance, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &e, nil
}
