package service

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/swimplan/backend/internal/model"
	"github.com/swimplan/backend/internal/repository"
)

const defaultRestSec = 20

// Generator creates workout plans from the exercise pool.
type Generator struct {
	repo *repository.Repo
}

// NewGenerator creates a new Generator.
func NewGenerator(repo *repository.Repo) *Generator {
	return &Generator{repo: repo}
}

// Generate builds a workout plan with warmup, main set, and cooldown phases.
func (g *Generator) Generate(ctx context.Context, totalDistance int) (*model.WorkoutPlan, error) {
	warmupBudget := int(float64(totalDistance) * 0.15)
	cooldownBudget := int(float64(totalDistance) * 0.10)
	mainBudget := totalDistance - warmupBudget - cooldownBudget

	warmupExercises, err := g.repo.ListExercisesByPhase(ctx, "warmup")
	if err != nil {
		return nil, fmt.Errorf("fetch warmup exercises: %w", err)
	}
	mainExercises, err := g.repo.ListExercisesByPhase(ctx, "main")
	if err != nil {
		return nil, fmt.Errorf("fetch main exercises: %w", err)
	}
	cooldownExercises, err := g.repo.ListExercisesByPhase(ctx, "cooldown")
	if err != nil {
		return nil, fmt.Errorf("fetch cooldown exercises: %w", err)
	}

	warmup := fillPhase(warmupExercises, warmupBudget, defaultRestSec)
	mainSet := fillPhase(mainExercises, mainBudget, defaultRestSec)
	cooldown := fillPhase(cooldownExercises, cooldownBudget, defaultRestSec)

	plan := &model.WorkoutPlan{
		Name:        fmt.Sprintf("%dm workout", totalDistance),
		TotalMeters: sumItems(warmup) + sumItems(mainSet) + sumItems(cooldown),
		Warmup:      warmup,
		MainSet:     mainSet,
		Cooldown:    cooldown,
	}
	return plan, nil
}

// fillPhase picks random exercises from the pool and assigns sets/distances
// until the budget is approximately met.
func fillPhase(pool []model.Exercise, budget int, restSec int) []model.PlanItem {
	if len(pool) == 0 || budget <= 0 {
		return nil
	}

	var items []model.PlanItem
	remaining := budget

	shuffled := make([]model.Exercise, len(pool))
	copy(shuffled, pool)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	idx := 0
	for remaining > 0 {
		ex := shuffled[idx%len(shuffled)]
		dist := ex.Distance
		if dist <= 0 {
			dist = 100
		}

		sets := 1
		if remaining >= dist*2 {
			sets = rand.Intn(3) + 1 // 1-3 sets
			if sets*dist > remaining {
				sets = remaining / dist
				if sets < 1 {
					sets = 1
				}
			}
		}
		if dist > remaining {
			dist = remaining
		}

		items = append(items, model.PlanItem{
			Name:     ex.Name,
			Sets:     sets,
			Distance: dist,
			RestSec:  restSec,
			Notes:    ex.Description,
		})
		remaining -= sets * dist
		idx++

		if idx > len(shuffled)*3 {
			break
		}
	}
	return items
}

func sumItems(items []model.PlanItem) int {
	total := 0
	for _, it := range items {
		total += it.Sets * it.Distance
	}
	return total
}
