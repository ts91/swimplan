package repository

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"

	"github.com/swimplan/backend/internal/model"
)

// SaveWorkout persists a workout plan with its items.
func (r *Repo) SaveWorkout(ctx context.Context, userID string, plan *model.WorkoutPlan) (string, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	var planID string
	err = tx.QueryRowContext(ctx, `
		INSERT INTO workout_plans (user_id, name, total_meters)
		VALUES ($1, $2, $3)
		RETURNING id`, userID, plan.Name, plan.TotalMeters).Scan(&planID)
	if err != nil {
		return "", err
	}

	order := 0
	for _, phase := range []struct {
		name  string
		items []model.PlanItem
	}{
		{"warmup", plan.Warmup},
		{"main", plan.MainSet},
		{"cooldown", plan.Cooldown},
	} {
		for _, it := range phase.items {
			_, err := tx.ExecContext(ctx, `
				INSERT INTO plan_items (workout_plan_id, phase, name, abbrev, sets, distance, rest_sec, notes, sort_order)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
				planID, phase.name, it.Name, it.Abbrev, it.Sets, it.Distance, it.RestSec, it.Notes, order)
			if err != nil {
				return "", err
			}
			order++
		}
	}

	return planID, tx.Commit()
}

// ListWorkouts returns the user's own workouts + subscribed workouts.
func (r *Repo) ListWorkouts(ctx context.Context, userID string) ([]model.WorkoutSummary, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT wp.id, wp.name, wp.total_meters, wp.is_public, (wp.user_id = $1) AS is_owner, wp.created_at
		FROM workout_plans wp
		WHERE wp.user_id = $1
		UNION
		SELECT wp.id, wp.name, wp.total_meters, wp.is_public, false AS is_owner, wp.created_at
		FROM workout_plans wp
		JOIN workout_subscriptions ws ON ws.workout_plan_id = wp.id
		WHERE ws.user_id = $1
		ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.WorkoutSummary
	for rows.Next() {
		var w model.WorkoutSummary
		if err := rows.Scan(&w.ID, &w.Name, &w.TotalMeters, &w.IsPublic, &w.IsOwner, &w.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

// GetWorkout loads a full workout by ID.
func (r *Repo) GetWorkout(ctx context.Context, id string) (*model.SavedWorkout, error) {
	var w model.SavedWorkout
	var shareToken sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, name, total_meters, share_token, is_public, created_at
		FROM workout_plans WHERE id = $1`, id).
		Scan(&w.ID, &w.UserID, &w.Name, &w.TotalMeters, &shareToken, &w.IsPublic, &w.CreatedAt)
	if err != nil {
		return nil, err
	}
	if shareToken.Valid {
		w.ShareToken = &shareToken.String
	}

	w.Warmup = []model.PlanItem{}
	w.MainSet = []model.PlanItem{}
	w.Cooldown = []model.PlanItem{}

	rows, err := r.db.QueryContext(ctx, `
		SELECT phase, name, abbrev, sets, distance, rest_sec, notes
		FROM plan_items WHERE workout_plan_id = $1 ORDER BY sort_order`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var phase string
		var it model.PlanItem
		if err := rows.Scan(&phase, &it.Name, &it.Abbrev, &it.Sets, &it.Distance, &it.RestSec, &it.Notes); err != nil {
			return nil, err
		}
		switch phase {
		case "warmup":
			w.Warmup = append(w.Warmup, it)
		case "cooldown":
			w.Cooldown = append(w.Cooldown, it)
		default:
			w.MainSet = append(w.MainSet, it)
		}
	}
	return &w, rows.Err()
}

// GetWorkoutByShareToken loads a public workout by its share token.
func (r *Repo) GetWorkoutByShareToken(ctx context.Context, token string) (*model.SavedWorkout, error) {
	var id string
	err := r.db.QueryRowContext(ctx, `
		SELECT id FROM workout_plans WHERE share_token = $1 AND is_public = true`, token).Scan(&id)
	if err != nil {
		return nil, err
	}
	return r.GetWorkout(ctx, id)
}

// DeleteWorkout deletes a workout owned by the given user.
func (r *Repo) DeleteWorkout(ctx context.Context, id, userID string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM workout_plans WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// ShareWorkout generates a share token and makes the workout public.
func (r *Repo) ShareWorkout(ctx context.Context, id, userID string) (string, error) {
	token := generateToken()
	res, err := r.db.ExecContext(ctx, `
		UPDATE workout_plans SET share_token = $1, is_public = true
		WHERE id = $2 AND user_id = $3`, token, id, userID)
	if err != nil {
		return "", err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return "", sql.ErrNoRows
	}
	return token, nil
}

// SubscribeWorkout subscribes a user to a shared workout.
func (r *Repo) SubscribeWorkout(ctx context.Context, userID, workoutID string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO workout_subscriptions (user_id, workout_plan_id)
		VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, workoutID)
	return err
}

// UnsubscribeWorkout removes a subscription.
func (r *Repo) UnsubscribeWorkout(ctx context.Context, userID, workoutID string) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM workout_subscriptions WHERE user_id = $1 AND workout_plan_id = $2`, userID, workoutID)
	return err
}

func generateToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// ListPublicWorkouts returns recently shared public workouts, with optional search.
func (r *Repo) ListPublicWorkouts(ctx context.Context, query string, limit int) ([]model.WorkoutSummary, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	var rows *sql.Rows
	var err error
	if query != "" {
		rows, err = r.db.QueryContext(ctx, `
			SELECT id, name, total_meters, is_public, false AS is_owner, created_at
			FROM workout_plans
			WHERE is_public = true AND name ILIKE '%' || $1 || '%'
			ORDER BY created_at DESC LIMIT $2`, query, limit)
	} else {
		rows, err = r.db.QueryContext(ctx, `
			SELECT id, name, total_meters, is_public, false AS is_owner, created_at
			FROM workout_plans
			WHERE is_public = true
			ORDER BY created_at DESC LIMIT $1`, limit)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.WorkoutSummary
	for rows.Next() {
		var w model.WorkoutSummary
		if err := rows.Scan(&w.ID, &w.Name, &w.TotalMeters, &w.IsPublic, &w.IsOwner, &w.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}
