import { useState } from 'react'
import { exportWorkout, type WorkoutPlan } from '../api/workouts'

const FORMATS = [
  { id: 'text', label: 'Plain Text', ext: 'txt', icon: '📄' },
  // Future formats:
  // { id: 'pdf', label: 'PDF', ext: 'pdf', icon: '📑' },
  // { id: 'fit', label: 'Garmin FIT', ext: 'fit', icon: '⌚' },
]

export function ExportSection({ plan }: { plan: WorkoutPlan }) {
  const [exporting, setExporting] = useState<string | null>(null)

  async function handleExport(formatId: string, ext: string) {
    setExporting(formatId)
    try {
      const blob = await exportWorkout(plan, formatId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workout.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Export Workout</h3>
      <div className="flex gap-3">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => handleExport(fmt.id, fmt.ext)}
            disabled={exporting !== null}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50 transition"
          >
            <span>{fmt.icon}</span>
            <span>{exporting === fmt.id ? 'Exporting...' : fmt.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">More formats coming soon (PDF, Garmin FIT).</p>
    </div>
  )
}
