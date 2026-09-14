package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/kelseyhightower/envconfig"
	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	dbpkg "github.com/swimplan/backend/db"
	"github.com/swimplan/backend/internal/handler"
	mw "github.com/swimplan/backend/internal/middleware"
	"github.com/swimplan/backend/internal/repository"
	"github.com/swimplan/backend/internal/service"
)

type Config struct {
	Port               string   `envconfig:"PORT" default:"8080"`
	DatabaseURL        string   `envconfig:"DATABASE_URL" default:"postgres://swimplan:swimplan@localhost:5432/swimplan?sslmode=disable"`
	JWTSecret          string   `envconfig:"JWT_SECRET" default:"dev-secret-change-me"`
	AllowedOrigins     []string `envconfig:"ALLOWED_ORIGINS" default:"http://localhost:5173,http://localhost:3000"`
	GoogleClientID     string   `envconfig:"GOOGLE_CLIENT_ID" default:""`
	GoogleClientSecret string   `envconfig:"GOOGLE_CLIENT_SECRET" default:""`
	GoogleRedirectURL  string   `envconfig:"GOOGLE_REDIRECT_URL" default:"http://localhost:8080/api/v1/auth/google/callback"`
	FrontendURL        string   `envconfig:"FRONTEND_URL" default:"http://localhost:3000"`
}

func main() {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}
	log.Println("connected to database")

	// Run migrations
	goose.SetBaseFS(dbpkg.Migrations)
	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatalf("failed to set goose dialect: %v", err)
	}
	if err := goose.Up(db, "migrations"); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}
	log.Println("migrations applied")

	// Dependencies
	repo := repository.New(db)
	gen := service.NewGenerator(repo)
	h := handler.New(repo, gen)

	oauthCfg := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	oa := &handler.OAuth{
		Config:      oauthCfg,
		Repo:        repo,
		JWTSecret:   []byte(cfg.JWTSecret),
		FrontendURL: cfg.FrontendURL,
	}

	// Router
	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	// Cookie-based auth: injects user ID into context if cookie present
	r.Use(handler.CookieAuth(cfg.JWTSecret))

	// Routes
	r.Get("/healthz", handler.Healthz)

	r.Route("/api/v1", func(r chi.Router) {
		// Auth
		r.Get("/auth/google", oa.GoogleLogin)
		r.Get("/auth/google/callback", oa.GoogleCallback)
		r.Post("/auth/logout", oa.Logout)

		// Auth-aware (user injected by CookieAuth middleware if logged in)
		r.Get("/auth/me", oa.Me)

		// Public
		r.Get("/exercises", h.ListExercises)
		r.Post("/exercises", h.CreateExercise)
		r.Get("/exercises/{id}", h.GetExercise)
		r.Post("/workouts/generate", h.GenerateWorkout)
		r.Post("/workouts/export", h.ExportWorkout)
		r.Get("/shared/{token}", h.GetSharedWorkout)

		// Protected (require auth)
		r.Group(func(r chi.Router) {
			r.Use(mw.RequireAuth)
			r.Post("/workouts", h.SaveWorkout)
			r.Get("/workouts", h.ListWorkouts)
			r.Get("/workouts/{id}", h.GetWorkout)
			r.Delete("/workouts/{id}", h.DeleteWorkout)
			r.Post("/workouts/{id}/share", h.ShareWorkout)
			r.Post("/workouts/{id}/subscribe", h.SubscribeWorkout)
			r.Delete("/workouts/{id}/subscribe", h.UnsubscribeWorkout)
		})
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server shutdown error: %v", err)
	}
	log.Println("server stopped")
}
