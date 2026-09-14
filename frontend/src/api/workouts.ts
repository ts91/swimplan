export interface PlanItem {
  name: string
  abbrev: string
  sets: number
  distance: number
  rest_sec: number
  notes: string
}

export interface WorkoutPlan {
  name: string
  total_meters: number
  warmup: PlanItem[]
  main_set: PlanItem[]
  cooldown: PlanItem[]
}

export interface GenerateRequest {
  total_distance: number
}

export async function generateWorkout(req: GenerateRequest): Promise<WorkoutPlan> {
  const res = await fetch('/api/v1/workouts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'request failed' }))
    throw new Error(err.error || 'Failed to generate workout')
  }
  return res.json()
}

export async function exportWorkout(plan: WorkoutPlan, format = 'text'): Promise<Blob> {
  const res = await fetch(`/api/v1/workouts/export?format=${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  })
  if (!res.ok) {
    throw new Error('Failed to export workout')
  }
  return res.blob()
}
