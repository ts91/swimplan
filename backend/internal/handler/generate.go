package handler

import (
	"net/http"

	"github.com/swimplan/backend/internal/model"
)

// GenerateWorkout handles POST /api/v1/workouts/generate.
func (h *Handler) GenerateWorkout(w http.ResponseWriter, r *http.Request) {
	var req model.GenerateRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TotalDistance < 200 || req.TotalDistance > 10000 {
		writeError(w, http.StatusBadRequest, "total_distance must be between 200 and 10000")
		return
	}

	plan, err := h.Generator.Generate(r.Context(), req.TotalDistance)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate workout")
		return
	}
	writeJSON(w, http.StatusOK, plan)
}
