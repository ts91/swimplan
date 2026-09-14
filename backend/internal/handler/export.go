package handler

import (
	"fmt"
	"net/http"

	"github.com/swimplan/backend/internal/export"
	"github.com/swimplan/backend/internal/model"
)

// ExportWorkout handles POST /api/v1/workouts/export?format=text.
// It accepts a workout plan in the request body and returns the
// exported file in the requested format.
func (h *Handler) ExportWorkout(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "text"
	}

	exporter, ok := export.Registry[format]
	if !ok {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported export format: %s", format))
		return
	}

	var plan model.WorkoutPlan
	if err := readJSON(r, &plan); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	data, err := exporter.Export(&plan)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "export failed")
		return
	}

	w.Header().Set("Content-Type", exporter.ContentType())
	w.Header().Set("Content-Disposition",
		fmt.Sprintf("attachment; filename=\"workout.%s\"", exporter.FileExtension()))
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
