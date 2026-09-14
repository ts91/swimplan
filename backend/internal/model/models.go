package model

import "time"

// Exercise is a stroke/drill template — no distance or phase.
type Exercise struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Abbrev      string      `json:"abbrev"`
	Category    string      `json:"category"`
	Description string      `json:"description"`
	Equipment   []Equipment `json:"equipment"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// Equipment represents a piece of swim equipment (e.g. kickboard, fins).
type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Abbrev string `json:"abbrev"`
}

// User represents an application user.
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Provider  string    `json:"provider"`
	ProviderID string   `json:"-"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// WorkoutPlan represents a generated swimming workout.
type WorkoutPlan struct {
	Name        string     `json:"name"`
	TotalMeters int        `json:"total_meters"`
	Warmup      []PlanItem `json:"warmup"`
	MainSet     []PlanItem `json:"main_set"`
	Cooldown    []PlanItem `json:"cooldown"`
}

// PlanItem is a single exercise within a workout plan, with phase and distance assigned.
type PlanItem struct {
	Name     string `json:"name"`
	Abbrev   string `json:"abbrev"`
	Sets     int    `json:"sets"`
	Distance int    `json:"distance"`
	RestSec  int    `json:"rest_sec"`
	Notes    string `json:"notes"`
}

// GenerateRequest is the input for workout generation.
type GenerateRequest struct {
	TotalDistance int `json:"total_distance"`
}
