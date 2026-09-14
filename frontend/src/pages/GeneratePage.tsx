import { useState } from 'react'
import { useGenerateWorkout } from '../hooks/useGenerateWorkout'
import { PlanDisplay } from '../components/PlanDisplay'
import { ExportSection } from '../components/ExportSection'

export function GeneratePage() {
  const [distance, setDistance] = useState(2000)
  const { mutate, data: plan, isPending, error, reset } = useGenerateWorkout()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate({ total_distance: distance })
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

      {plan && (
        <>
          <PlanDisplay plan={plan} />
          <ExportSection plan={plan} />
        </>
      )}
    </div>
  )
}
