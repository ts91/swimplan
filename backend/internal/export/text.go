package export

import (
	"fmt"
	"strings"

	"github.com/swimplan/backend/internal/model"
)

// TextExporter renders a workout plan as compact plain text
// using exercise abbreviations, suitable for printing.
type TextExporter struct{}

func (e *TextExporter) Export(plan *model.WorkoutPlan) ([]byte, error) {
	var b strings.Builder

	fmt.Fprintf(&b, "%s\n", plan.Name)
	fmt.Fprintf(&b, "%s\n\n", strings.Repeat("=", len(plan.Name)))

	writePhase(&b, "Warmup", plan.Warmup)
	writePhase(&b, "Main Set", plan.MainSet)
	writePhase(&b, "Cooldown", plan.Cooldown)

	fmt.Fprintf(&b, "---\nTotal: %dm\n", plan.TotalMeters)

	return []byte(b.String()), nil
}

func (e *TextExporter) ContentType() string  { return "text/plain; charset=utf-8" }
func (e *TextExporter) FileExtension() string { return "txt" }

func writePhase(b *strings.Builder, title string, items []model.PlanItem) {
	if len(items) == 0 {
		return
	}

	total := 0
	for _, it := range items {
		total += it.Sets * it.Distance
	}

	fmt.Fprintf(b, "--- %s (%dm) ---\n", title, total)
	for _, it := range items {
		label := it.Abbrev
		if label == "" {
			label = it.Name
		}
		if it.Sets > 1 {
			fmt.Fprintf(b, "  %dx%dm %s  (%ds rest)\n", it.Sets, it.Distance, label, it.RestSec)
		} else {
			fmt.Fprintf(b, "  %dm %s\n", it.Distance, label)
		}
	}
	fmt.Fprintln(b)
}
