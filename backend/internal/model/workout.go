package model

// SavedWorkout is a persisted workout with its items.
type SavedWorkout struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	Name       string     `json:"name"`
	TotalMeters int       `json:"total_meters"`
	ShareToken *string    `json:"share_token,omitempty"`
	IsPublic   bool       `json:"is_public"`
	CreatedAt  string     `json:"created_at"`
	Warmup     []PlanItem `json:"warmup"`
	MainSet    []PlanItem `json:"main_set"`
	Cooldown   []PlanItem `json:"cooldown"`
}

// WorkoutSummary is a compact listing of a workout.
type WorkoutSummary struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	TotalMeters int    `json:"total_meters"`
	IsPublic    bool   `json:"is_public"`
	IsOwner     bool   `json:"is_owner"`
	CreatedAt   string `json:"created_at"`
}
