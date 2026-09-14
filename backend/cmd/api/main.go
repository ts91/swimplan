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

	dbpkg "github.com/swimplan/backend/db"
	"github.com/swimplan/backend/internal/handler"
	"github.com/swimplan/backend/internal/repository"
	"github.com/swimplan/backend/internal/service"
)

type Config struct {
	Port           string   `envconfig:"PORT" default:"8080"`
	DatabaseURL    string   `envconfig:"DATABASE_URL" default:"postgres://swimplan:swimplan@localhost:5432/swimplan?sslmode=disable"`
	JWTSecret      string   `envconfig:"JWT_SECRET" default:"dev-secret-change-me"`
	AllowedOrigins []string `envconfig:"ALLOWED_ORIGINS" default:"http://localhost:5173"`
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

	// Routes
	r.Get("/healthz", handler.Healthz)

	r.Route("/api/v1", func(r chi.Router) {
		// Auth (stubs, kept for future use)
		r.Post("/auth/register", handler.Register)
		r.Post("/auth/login", handler.Login)

		// Public — no auth required for MVP
		r.Get("/exercises", h.ListExercises)
		r.Post("/exercises", h.CreateExercise)
		r.Get("/exercises/{id}", h.GetExercise)
		r.Post("/workouts/generate", h.GenerateWorkout)
		r.Post("/workouts/export", h.ExportWorkout)
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
