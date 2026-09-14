import { useState } from 'react'
import { useExercises } from '../hooks/useExercises'
import { useCreateWorkout } from '../hooks/useCreateWorkout'
import { PlanDisplay } from '../components/PlanDisplay'
import { ExportSection } from '../components/ExportSection'
import { SaveWorkoutButton } from '../components/SaveWorkoutButton'

const PHASES = [
  { key: 'warmup' as const, label: 'Warmup' },
  { key: 'mainSet' as const, label: 'Main Set' },
  { key: 'cooldown' as const, label: 'Cooldown' },
]

export function CreatePage() {
  const { data: exercises } = useExercises()
  const { state, totalMeters, addItem, updateItem, removeItem, setName, toPlan } = useCreateWorkout()
  const [search, setSearch] = useState('')
  const [activePhase, setActivePhase] = useState<'warmup' | 'mainSet' | 'cooldown'>('mainSet')
  const [showPreview, setShowPreview] = useState(false)

  const filtered = exercises?.filter(
    (ex) => ex.name.toLowerCase().includes(search.toLowerCase()) || ex.category.toLowerCase().includes(search.toLowerCase()),
  )

  const plan = toPlan()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Create Workout</h1>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {totalMeters}m total
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise picker */}
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Exercise Pool</h2>
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm mb-2"
            />
            <div className="flex gap-1 mb-2">
              {PHASES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActivePhase(p.key)}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium ${
                    activePhase === p.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <ul className="space-y-1 max-h-80 overflow-y-auto">
              {filtered?.map((ex) => (
                <li key={ex.id}>
                  <button
                    onClick={() => addItem(activePhase, ex.name, ex.abbrev)}
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-blue-50 transition"
                  >
                    <span className="font-medium text-gray-900">{ex.name}</span>
                    <span className="ml-1 text-gray-400">({ex.abbrev})</span>
                    {ex.equipment?.map((eq) => (
                      <span key={eq.id} className="ml-1 text-xs text-amber-600">{eq.abbrev}</span>
                    ))}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          {PHASES.map((p) => {
            const items = state[p.key]
            const phaseTotal = items.reduce((t, it) => t + it.sets * it.distance, 0)
            return (
              <div key={p.key} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{p.label}</h3>
                  <span className="text-xs text-gray-500">{phaseTotal}m</span>
                </div>
                {items.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No exercises yet. Select a phase above and click an exercise to add it.</p>
                )}
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.localId} className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={item.sets}
                        onChange={(e) => updateItem(p.key, item.localId, { sets: Number(e.target.value) || 1 })}
                        className="w-14 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                        title="Sets"
                      />
                      <span className="text-xs text-gray-500">x</span>
                      <input
                        type="number"
                        min={25}
                        max={2000}
                        step={25}
                        value={item.distance}
                        onChange={(e) => updateItem(p.key, item.localId, { distance: Number(e.target.value) || 25 })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                        title="Distance (m)"
                      />
                      <span className="text-xs text-gray-500">m</span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        step={5}
                        value={item.rest_sec}
                        onChange={(e) => updateItem(p.key, item.localId, { rest_sec: Number(e.target.value) || 0 })}
                        className="w-14 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                        title="Rest (sec)"
                      />
                      <span className="text-xs text-gray-500">s</span>
                      <button
                        onClick={() => removeItem(p.key, item.localId)}
                        className="text-red-400 hover:text-red-600 text-sm px-1"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview((v) => !v)}
              disabled={totalMeters === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      {showPreview && totalMeters > 0 && (
        <>
          <PlanDisplay plan={plan} />
          <div className="flex gap-3">
            <SaveWorkoutButton plan={plan} />
          </div>
          <ExportSection plan={plan} />
        </>
      )}
    </div>
  )
}
