-- name: ListExercises :many
SELECT id, name, category, description, distance, created_at, updated_at
FROM exercises
ORDER BY name;

-- name: GetExercise :one
SELECT id, name, category, description, distance, created_at, updated_at
FROM exercises
WHERE id = $1;

-- name: CreateExercise :one
INSERT INTO exercises (name, category, description, distance)
VALUES ($1, $2, $3, $4)
RETURNING id, name, category, description, distance, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, email, password_hash, name, created_at, updated_at
FROM users
WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (email, password_hash, name)
VALUES ($1, $2, $3)
RETURNING id, email, name, created_at, updated_at;
