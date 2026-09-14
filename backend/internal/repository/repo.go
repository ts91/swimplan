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

// ListExercises returns all exercise templates ordered by name,
// with their equipment eagerly loaded.
func (r *Repo) ListExercises(ctx context.Context) ([]model.Exercise, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, abbrev, category, description, created_at, updated_at
		FROM exercises ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Exercise
	for rows.Next() {
		var e model.Exercise
		if err := rows.Scan(&e.ID, &e.Name, &e.Abbrev, &e.Category, &e.Description, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		e.Equipment = []model.Equipment{}
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Batch-load equipment for all exercises
	if len(out) > 0 {
		if err := r.loadEquipmentForExercises(ctx, out); err != nil {
			return nil, err
		}
	}
	return out, nil
}

// GetExercise returns a single exercise template by ID.
func (r *Repo) GetExercise(ctx context.Context, id string) (*model.Exercise, error) {
	var e model.Exercise
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, abbrev, category, description, created_at, updated_at
		FROM exercises WHERE id = $1`, id).
		Scan(&e.ID, &e.Name, &e.Abbrev, &e.Category, &e.Description, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, err
	}
	e.Equipment = []model.Equipment{}

	eqRows, err := r.db.QueryContext(ctx, `
		SELECT eq.id, eq.name, eq.abbrev
		FROM equipment eq
		JOIN exercise_equipment ee ON ee.equipment_id = eq.id
		WHERE ee.exercise_id = $1
		ORDER BY eq.name`, e.ID)
	if err != nil {
		return nil, err
	}
	defer eqRows.Close()
	for eqRows.Next() {
		var eq model.Equipment
		if err := eqRows.Scan(&eq.ID, &eq.Name, &eq.Abbrev); err != nil {
			return nil, err
		}
		e.Equipment = append(e.Equipment, eq)
	}
	return &e, eqRows.Err()
}

// CreateExercise inserts a new exercise template and returns it.
func (r *Repo) CreateExercise(ctx context.Context, name, abbrev, category, description string) (*model.Exercise, error) {
	var e model.Exercise
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO exercises (name, abbrev, category, description)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, abbrev, category, description, created_at, updated_at`,
		name, abbrev, category, description).
		Scan(&e.ID, &e.Name, &e.Abbrev, &e.Category, &e.Description, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, err
	}
	e.Equipment = []model.Equipment{}
	return &e, nil
}

// ListEquipment returns all equipment items.
func (r *Repo) ListEquipment(ctx context.Context) ([]model.Equipment, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, name, abbrev FROM equipment ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Equipment
	for rows.Next() {
		var eq model.Equipment
		if err := rows.Scan(&eq.ID, &eq.Name, &eq.Abbrev); err != nil {
			return nil, err
		}
		out = append(out, eq)
	}
	return out, rows.Err()
}

// loadEquipmentForExercises batch-loads equipment for a slice of exercises.
func (r *Repo) loadEquipmentForExercises(ctx context.Context, exercises []model.Exercise) error {
	rows, err := r.db.QueryContext(ctx, `
		SELECT ee.exercise_id, eq.id, eq.name, eq.abbrev
		FROM exercise_equipment ee
		JOIN equipment eq ON eq.id = ee.equipment_id
		ORDER BY eq.name`)
	if err != nil {
		return err
	}
	defer rows.Close()

	eqMap := make(map[string][]model.Equipment)
	for rows.Next() {
		var exID string
		var eq model.Equipment
		if err := rows.Scan(&exID, &eq.ID, &eq.Name, &eq.Abbrev); err != nil {
			return err
		}
		eqMap[exID] = append(eqMap[exID], eq)
	}
	if err := rows.Err(); err != nil {
		return err
	}

	for i := range exercises {
		if eqs, ok := eqMap[exercises[i].ID]; ok {
			exercises[i].Equipment = eqs
		}
	}
	return nil
}
