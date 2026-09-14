-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    phase TEXT NOT NULL DEFAULT 'main',
    description TEXT NOT NULL DEFAULT '',
    distance INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_meters INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    sets INT NOT NULL DEFAULT 1,
    distance INT NOT NULL DEFAULT 0,
    rest_sec INT NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
);

-- +goose Down
DROP TABLE IF EXISTS plan_items;
DROP TABLE IF EXISTS workout_plans;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;
