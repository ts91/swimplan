package handler

import "net/http"

// Register handles user registration (stub for future implementation).
func Register(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusCreated, map[string]string{"message": "registration endpoint — not yet implemented"})
}

// Login handles user login (stub for future implementation).
func Login(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"message": "login endpoint — not yet implemented"})
}
