package handler

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/swimplan/backend/internal/middleware"
	"github.com/swimplan/backend/internal/model"
)

// SaveWorkout persists a workout plan for the authenticated user.
func (h *Handler) SaveWorkout(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var plan model.WorkoutPlan
	if err := readJSON(r, &plan); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	id, err := h.Repo.SaveWorkout(r.Context(), userID, &plan)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save workout")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

// ListWorkouts returns the user's own + subscribed workouts.
func (h *Handler) ListWorkouts(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	workouts, err := h.Repo.ListWorkouts(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list workouts")
		return
	}
	if workouts == nil {
		workouts = []model.WorkoutSummary{}
	}
	writeJSON(w, http.StatusOK, workouts)
}

// GetWorkout returns a single workout by ID.
func (h *Handler) GetWorkout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	workout, err := h.Repo.GetWorkout(r.Context(), id)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "workout not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get workout")
		return
	}
	writeJSON(w, http.StatusOK, workout)
}

// DeleteWorkout deletes a workout owned by the current user.
func (h *Handler) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.GetUserID(r.Context())

	err := h.Repo.DeleteWorkout(r.Context(), id, userID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "workout not found or not owned by you")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete workout")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}

// ShareWorkout generates a share token for a workout.
func (h *Handler) ShareWorkout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.GetUserID(r.Context())

	token, err := h.Repo.ShareWorkout(r.Context(), id, userID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "workout not found or not owned by you")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to share workout")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"share_token": token})
}

// GetSharedWorkout returns a public workout by share token.
func (h *Handler) GetSharedWorkout(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	workout, err := h.Repo.GetWorkoutByShareToken(r.Context(), token)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "shared workout not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get shared workout")
		return
	}
	writeJSON(w, http.StatusOK, workout)
}

// SubscribeWorkout subscribes the current user to a shared workout.
func (h *Handler) SubscribeWorkout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.GetUserID(r.Context())

	if err := h.Repo.SubscribeWorkout(r.Context(), userID, id); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to subscribe")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "subscribed"})
}

// UnsubscribeWorkout unsubscribes the current user from a workout.
func (h *Handler) UnsubscribeWorkout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.GetUserID(r.Context())

	if err := h.Repo.UnsubscribeWorkout(r.Context(), userID, id); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to unsubscribe")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "unsubscribed"})
}
