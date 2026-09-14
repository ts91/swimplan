package handler

import (
	"encoding/json"
	"net/http"

	"github.com/swimplan/backend/internal/repository"
	"github.com/swimplan/backend/internal/service"
)

// Handler holds dependencies for HTTP handlers.
type Handler struct {
	Repo      *repository.Repo
	Generator *service.Generator
}

// New creates a new Handler.
func New(repo *repository.Repo, gen *service.Generator) *Handler {
	return &Handler{Repo: repo, Generator: gen}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func readJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}
