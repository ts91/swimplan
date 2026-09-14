package model

import "time"

// Exercise represents a swimming exercise.
type Exercise struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	Phase       string    `json:"phase"`
	Description string    `json:"description"`
	Distance    int       `json:"distance"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// User represents an application user.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// WorkoutPlan represents a generated swimming workout.
type WorkoutPlan struct {
	Name        string     `json:"name"`
	TotalMeters int        `json:"total_meters"`
	Warmup      []PlanItem `json:"warmup"`
	MainSet     []PlanItem `json:"main_set"`
	Cooldown    []PlanItem `json:"cooldown"`
}

// PlanItem is a single exercise within a workout plan.
type PlanItem struct {
	Name     string `json:"name"`
	Sets     int    `json:"sets"`
	Distance int    `json:"distance"`
	RestSec  int    `json:"rest_sec"`
	Notes    string `json:"notes"`
}

// GenerateRequest is the input for workout generation.
type GenerateRequest struct {
	TotalDistance int    `json:"total_distance"`
	Intensity    string `json:"intensity"`
}
