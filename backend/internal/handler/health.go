package handler

import "net/http"

// Healthz returns a simple health check response.
func Healthz(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
