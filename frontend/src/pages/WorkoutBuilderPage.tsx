import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { generateWorkout } from '../api/workouts'
import { saveWorkout, fetchPublicWorkouts, fetchWorkout, type WorkoutSummary } from '../api/savedWorkouts'
import { useCreateWorkout, type BuilderItem } from '../hooks/useCreateWorkout'
import { useAuth } from '../lib/auth'
import { ExercisePicker } from '../components/ExercisePicker'
import { ExportSection } from '../components/ExportSection'
import { Button, Card, Input, Badge } from '../components/ui'

type Tab = 'generate' | 'create' | 'find'

const PHASES = [
  { key: 'warmup' as const, label: 'Warmup', color: 'amber' as const },
  { key: 'mainSet' as const, label: 'Main Set', color: 'blue' as const },
  { key: 'cooldown' as const, label: 'Cooldown', color: 'green' as const },
]

export function WorkoutBuilderPage() {
  const [tab, setTab] = useState<Tab>('create')
  const { user } = useAuth()
  const builder = useCreateWorkout()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loadingWorkout, setLoadingWorkout] = useState(false)

  useEffect(() => {
    const loadId = searchParams.get('load')
    if (!loadId) return
    setLoadingWorkout(true)
    fetchWorkout(loadId)
      .then((saved) => {
        builder.loadPlan({
          name: saved.name,
          total_meters: saved.total_meters,
          warmup: saved.warmup,
          main_set: saved.main_set,
          cooldown: saved.cooldown,
        })
        setSearchParams({}, { replace: true })
      })
      .catch(() => {})
      .finally(() => setLoadingWorkout(false))
  }, [])

  if (loadingWorkout) {
    return <p className="text-gray-500">Loading workout...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">New Workout</h1>
        <Badge color="blue">{builder.totalMeters}m total</Badge>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { id: 'generate' as Tab, label: 'Random Generate' },
          { id: 'create' as Tab, label: 'Create' },
          { id: 'find' as Tab, label: 'Find' },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'generate' && <GeneratePanel onLoad={builder.loadPlan} />}
      {tab === 'find' && <FindPanel onLoad={builder.loadPlan} />}

      <BuilderSection builder={builder} user={user} />
    </div>
  )
}

/* ---- Generate Panel ---- */

function GeneratePanel({ onLoad }: { onLoad: (plan: import('../api/workouts').WorkoutPlan) => void }) {
  const [distance, setDistance] = useState(2000)
  const { mutate, isPending, error } = useMutation({
    mutationFn: generateWorkout,
    onSuccess: (plan) => onLoad(plan),
  })

  return (
    <Card className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total distance: <span className="font-bold text-blue-600">{distance}m</span>
        </label>
        <input
          type="range"
          min={500} max={5000} step={100}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>500m</span><span>5000m</span>
        </div>
      </div>
      <Button onClick={() => mutate({ total_distance: distance })} disabled={isPending} className="w-full">
        {isPending ? 'Generating...' : 'Generate Random Workout'}
      </Button>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </Card>
  )
}

/* ---- Find Panel ---- */

function FindPanel({ onLoad }: { onLoad: (plan: import('../api/workouts').WorkoutPlan) => void }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const { data: workouts, isLoading } = useQuery<WorkoutSummary[]>({
    queryKey: ['public-workouts', debouncedSearch],
    queryFn: () => fetchPublicWorkouts(debouncedSearch),
  })

  function handleSearchChange(val: string) {
    setSearch(val)
    clearTimeout((handleSearchChange as any)._t)
    ;(handleSearchChange as any)._t = setTimeout(() => setDebouncedSearch(val), 300)
  }

  async function handleLoadWorkout(id: string) {
    setLoadingId(id)
    try {
      const saved = await fetchWorkout(id)
      onLoad({
        name: saved.name,
        total_meters: saved.total_meters,
        warmup: saved.warmup,
        main_set: saved.main_set,
        cooldown: saved.cooldown,
      })
    } catch {
      alert('Failed to load workout')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Card className="space-y-3">
      <Input
        type="text"
        placeholder="Search shared workouts..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {workouts?.length === 0 && !isLoading && (
        <p className="text-sm text-gray-400 text-center py-4">No shared workouts found.</p>
      )}
      <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
        {workouts?.map((w) => (
          <li key={w.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{w.name}</p>
              <p className="text-xs text-gray-500">{w.total_meters}m</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleLoadWorkout(w.id)}
              disabled={loadingId === w.id}
            >
              {loadingId === w.id ? 'Loading...' : 'Use'}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ---- Builder Section ---- */

interface BuilderProps {
  builder: ReturnType<typeof useCreateWorkout>
  user: { id: string } | null
}

function BuilderSection({ builder, user }: BuilderProps) {
  const { state, totalMeters, addItem, updateItem, removeItem, setName, toPlan, clearPlan } = builder
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: () => saveWorkout(toPlan()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-workouts'] }),
  })

  useEffect(() => {
    if (saveMutation.isSuccess) saveMutation.reset()
  }, [state])

  const plan = toPlan()

  return (
    <>
      {/* Workout name */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
        <Input
          type="text"
          value={state.name}
          onChange={(e) => setName(e.target.value)}
        />
      </Card>

      {/* Phase sections */}
      {PHASES.map((p) => {
        const items = state[p.key] as BuilderItem[]
        const phaseTotal = items.reduce((t, it) => t + it.sets * it.distance, 0)
        const bgColor = { amber: 'bg-amber-50', blue: 'bg-blue-50', green: 'bg-green-50' }[p.color] ?? 'bg-gray-50'
        const headerColor = { amber: 'text-amber-800', blue: 'text-blue-800', green: 'text-green-800' }[p.color] ?? 'text-gray-800'

        return (
          <div key={p.key} className={`rounded-lg ${bgColor} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${headerColor}`}>{p.label}</h3>
              <span className="text-xs text-gray-500">{phaseTotal}m</span>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-2">No exercises yet.</p>
            )}

            <ul className="space-y-2 mb-3">
              {items.map((item) => (
                <li key={item.localId} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                      <span className="ml-1 text-xs text-gray-400">({item.abbrev})</span>
                    </p>
                  </div>
                  <input
                    type="number" min={1} max={20}
                    value={item.sets}
                    onChange={(e) => updateItem(p.key, item.localId, { sets: Number(e.target.value) || 1 })}
                    className="w-14 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                    title="Sets"
                  />
                  <span className="text-xs text-gray-500">x</span>
                  <input
                    type="number" min={25} max={2000} step={25}
                    value={item.distance}
                    onChange={(e) => updateItem(p.key, item.localId, { distance: Number(e.target.value) || 25 })}
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                    title="Distance (m)"
                  />
                  <span className="text-xs text-gray-500">m</span>
                  <input
                    type="number" min={0} max={120} step={5}
                    value={item.rest_sec}
                    onChange={(e) => updateItem(p.key, item.localId, { rest_sec: Number(e.target.value) || 0 })}
                    className="w-14 rounded border border-gray-300 px-2 py-1 text-xs text-center"
                    title="Rest (sec)"
                  />
                  <span className="text-xs text-gray-500">s</span>
                  <Button variant="danger" size="sm" onClick={() => removeItem(p.key, item.localId)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>

            <ExercisePicker onSelect={(name, abbrev) => addItem(p.key, name, abbrev)} />
          </div>
        )
      })}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {user && (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={totalMeters === 0 || saveMutation.isPending || saveMutation.isSuccess}
            className="bg-green-600 hover:bg-green-700"
          >
            {saveMutation.isPending ? 'Saving...' : saveMutation.isSuccess ? 'Saved!' : 'Save Workout'}
          </Button>
        )}
        <Button variant="secondary" onClick={clearPlan} disabled={totalMeters === 0}>
          Clear
        </Button>
      </div>

      {totalMeters > 0 && <ExportSection plan={plan} />}
    </>
  )
}
