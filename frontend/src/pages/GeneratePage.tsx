import { useState } from 'react'
import { useGenerateWorkout } from '../hooks/useGenerateWorkout'
import { exportWorkout } from '../api/workouts'
import type { PlanItem, WorkoutPlan } from '../api/workouts'

export function GeneratePage() {
  const [distance, setDistance] = useState(2000)
  const { mutate, data: plan, isPending, error, reset } = useGenerateWorkout()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate({ total_distance: distance })
  }

  async function handleExport() {
    if (!plan) return
    try {
      const blob = await exportWorkout(plan)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'workout.txt'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Generate Workout</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total distance: <span className="font-bold text-blue-600">{distance}m</span>
          </label>
          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={distance}
            onChange={(e) => { setDistance(Number(e.target.value)); reset() }}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500m</span>
            <span>5000m</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Generating...' : 'Generate Workout'}
        </button>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
      </form>

      {plan && <PlanDisplay plan={plan} onExport={handleExport} />}
    </div>
  )
}

function PlanDisplay({ plan, onExport }: { plan: WorkoutPlan; onExport: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {plan.total_meters}m total
          </span>
          <button
            onClick={onExport}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Export .txt
          </button>
        </div>
      </div>

      <PhaseSection title="Warmup" items={plan.warmup} color="amber" />
      <PhaseSection title="Main Set" items={plan.main_set} color="blue" />
      <PhaseSection title="Cooldown" items={plan.cooldown} color="green" />
    </div>
  )
}

function PhaseSection({ title, items, color }: { title: string; items: PlanItem[]; color: string }) {
  if (!items || items.length === 0) return null

  const bgColor = { amber: 'bg-amber-50', blue: 'bg-blue-50', green: 'bg-green-50' }[color] ?? 'bg-gray-50'
  const headerColor = { amber: 'text-amber-800', blue: 'text-blue-800', green: 'text-green-800' }[color] ?? 'text-gray-800'
  const badgeColor = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  }[color] ?? 'bg-gray-100 text-gray-700'

  const phaseTotal = items.reduce((sum, it) => sum + it.sets * it.distance, 0)

  return (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${headerColor}`}>{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
          {phaseTotal}m
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm">
            <div>
              <p className="font-medium text-gray-900">
                {item.name}
                <span className="ml-2 text-xs text-gray-400">({item.abbrev})</span>
              </p>
              <p className="text-xs text-gray-500">{item.notes}</p>
            </div>
            <div className="text-right text-sm text-gray-600 whitespace-nowrap ml-4">
              <p>{item.sets} x {item.distance}m</p>
              <p className="text-xs text-gray-400">{item.rest_sec}s rest</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
