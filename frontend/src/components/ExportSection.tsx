import { useState } from 'react'
import { exportWorkout, type WorkoutPlan } from '../api/workouts'
import { Card, Button } from './ui'

const FORMATS = [
  { id: 'text', label: 'Plain Text', ext: 'txt', icon: '📄' },
  { id: 'pdf', label: 'PDF', ext: 'pdf', icon: '📑' },
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
    <Card>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Export Workout</h3>
      <div className="flex gap-3">
        {FORMATS.map((fmt) => (
          <Button
            key={fmt.id}
            variant="secondary"
            onClick={() => handleExport(fmt.id, fmt.ext)}
            disabled={exporting !== null}
          >
            <span className="mr-2">{fmt.icon}</span>
            {exporting === fmt.id ? 'Exporting...' : fmt.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
