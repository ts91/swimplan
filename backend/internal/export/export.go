package export

import "github.com/swimplan/backend/internal/model"

// Exporter converts a workout plan into a specific output format.
type Exporter interface {
	// Export serialises the workout plan into bytes.
	Export(plan *model.WorkoutPlan) ([]byte, error)
	// ContentType returns the MIME type for the exported format.
	ContentType() string
	// FileExtension returns the file extension (without dot).
	FileExtension() string
}

// Registry maps format names to their Exporter implementation.
var Registry = map[string]Exporter{
	"text": &TextExporter{},
}
