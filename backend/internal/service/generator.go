package service

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/swimplan/backend/internal/model"
	"github.com/swimplan/backend/internal/repository"
)

const defaultRestSec = 20

// phasePool maps categories to the phases they are suitable for.
var phasePool = map[string][]string{
	"freestyle":    {"main", "cooldown"},
	"sprint":       {"main"},
	"backstroke":   {"main", "cooldown"},
	"breaststroke": {"main", "cooldown"},
	"butterfly":    {"main"},
	"mixed":        {"warmup", "main", "cooldown"},
	"kick":         {"warmup", "main", "cooldown"},
	"pull":         {"main"},
	"drill":        {"warmup", "cooldown"},
}

// defaultDistance maps categories to a typical distance assignment.
var defaultDistance = map[string]int{
	"freestyle":    200,
	"sprint":       50,
	"backstroke":   100,
	"breaststroke": 100,
	"butterfly":    50,
	"mixed":        100,
	"kick":         100,
	"pull":         200,
	"drill":        50,
}

// Generator creates workout plans from the exercise template pool.
type Generator struct {
	repo *repository.Repo
}

// NewGenerator creates a new Generator.
func NewGenerator(repo *repository.Repo) *Generator {
	return &Generator{repo: repo}
}

// Generate builds a workout plan with warmup, main set, and cooldown phases.
// It fetches all exercise templates, filters them by category suitability,
// and assigns distances per-category defaults.
func (g *Generator) Generate(ctx context.Context, totalDistance int) (*model.WorkoutPlan, error) {
	allExercises, err := g.repo.ListExercises(ctx)
	if err != nil {
		return nil, fmt.Errorf("fetch exercises: %w", err)
	}

	warmupPool := filterForPhase(allExercises, "warmup")
	mainPool := filterForPhase(allExercises, "main")
	cooldownPool := filterForPhase(allExercises, "cooldown")

	warmupBudget := int(float64(totalDistance) * 0.15)
	cooldownBudget := int(float64(totalDistance) * 0.10)
	mainBudget := totalDistance - warmupBudget - cooldownBudget

	warmup := fillPhase(warmupPool, warmupBudget)
	mainSet := fillPhase(mainPool, mainBudget)
	cooldown := fillPhase(cooldownPool, cooldownBudget)

	plan := &model.WorkoutPlan{
		Name:        fmt.Sprintf("%dm workout", totalDistance),
		TotalMeters: sumItems(warmup) + sumItems(mainSet) + sumItems(cooldown),
		Warmup:      warmup,
		MainSet:     mainSet,
		Cooldown:    cooldown,
	}
	return plan, nil
}

// filterForPhase returns exercises whose category is suitable for the given phase.
func filterForPhase(exercises []model.Exercise, phase string) []model.Exercise {
	var out []model.Exercise
	for _, ex := range exercises {
		phases, ok := phasePool[ex.Category]
		if !ok {
			continue
		}
		for _, p := range phases {
			if p == phase {
				out = append(out, ex)
				break
			}
		}
	}
	return out
}

// distanceForExercise returns the typical distance for an exercise based on category.
func distanceForExercise(ex model.Exercise) int {
	if d, ok := defaultDistance[ex.Category]; ok {
		return d
	}
	return 100
}

// fillPhase picks random exercises from the pool and assigns sets/distances
// until the budget is approximately met.
func fillPhase(pool []model.Exercise, budget int) []model.PlanItem {
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
		dist := distanceForExercise(ex)

		sets := 1
		if remaining >= dist*2 {
			sets = rand.Intn(3) + 1
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
			Abbrev:   ex.Abbrev,
			Sets:     sets,
			Distance: dist,
			RestSec:  defaultRestSec,
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
