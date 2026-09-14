package handler

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// ListExercises returns all exercise templates from the database.
func (h *Handler) ListExercises(w http.ResponseWriter, r *http.Request) {
	exercises, err := h.Repo.ListExercises(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list exercises")
		return
	}
	writeJSON(w, http.StatusOK, exercises)
}

// CreateExercise creates a new exercise template.
func (h *Handler) CreateExercise(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Abbrev      string `json:"abbrev"`
		Category    string `json:"category"`
		Description string `json:"description"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	ex, err := h.Repo.CreateExercise(r.Context(), req.Name, req.Abbrev, req.Category, req.Description)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create exercise")
		return
	}
	writeJSON(w, http.StatusCreated, ex)
}

// GetExercise returns a single exercise template by ID.
func (h *Handler) GetExercise(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ex, err := h.Repo.GetExercise(r.Context(), id)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "exercise not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get exercise")
		return
	}
	writeJSON(w, http.StatusOK, ex)
}
