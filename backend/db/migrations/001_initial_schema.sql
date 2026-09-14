-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL DEFAULT 'google',
    provider_id TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_users_provider ON users(provider, provider_id);

-- Exercises are stroke/drill templates — no distance or phase.
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    abbrev TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    abbrev TEXT NOT NULL DEFAULT ''
);

CREATE TABLE exercise_equipment (
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, equipment_id)
);

CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_meters INT NOT NULL DEFAULT 0,
    pool_length INT NOT NULL DEFAULT 25,
    share_token TEXT UNIQUE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id),
    phase TEXT NOT NULL DEFAULT 'main',
    name TEXT NOT NULL DEFAULT '',
    abbrev TEXT NOT NULL DEFAULT '',
    sets INT NOT NULL DEFAULT 1,
    distance INT NOT NULL DEFAULT 0,
    rest_sec INT NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE workout_subscriptions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, workout_plan_id)
);

-- +goose Down
DROP TABLE IF EXISTS workout_subscriptions;
DROP TABLE IF EXISTS plan_items;
DROP TABLE IF EXISTS workout_plans;
DROP TABLE IF EXISTS exercise_equipment;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;
