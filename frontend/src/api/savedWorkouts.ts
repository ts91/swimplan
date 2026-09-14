export interface WorkoutSummary {
  id: string
  name: string
  total_meters: number
  is_public: boolean
  is_owner: boolean
  created_at: string
}

export interface SavedWorkout {
  id: string
  user_id: string
  name: string
  total_meters: number
  share_token?: string
  is_public: boolean
  created_at: string
  warmup: import('./workouts').PlanItem[]
  main_set: import('./workouts').PlanItem[]
  cooldown: import('./workouts').PlanItem[]
}

export async function fetchMyWorkouts(): Promise<WorkoutSummary[]> {
  const res = await fetch('/api/v1/workouts', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch workouts')
  return res.json()
}

export async function fetchWorkout(id: string): Promise<SavedWorkout> {
  const res = await fetch(`/api/v1/workouts/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch workout')
  return res.json()
}

export async function fetchSharedWorkout(token: string): Promise<SavedWorkout> {
  const res = await fetch(`/api/v1/shared/${token}`)
  if (!res.ok) throw new Error('Shared workout not found')
  return res.json()
}

export async function fetchPublicWorkouts(query = ''): Promise<WorkoutSummary[]> {
  const url = query ? `/api/v1/shared?q=${encodeURIComponent(query)}` : '/api/v1/shared'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch public workouts')
  return res.json()
}

export async function saveWorkout(plan: import('./workouts').WorkoutPlan): Promise<{ id: string }> {
  const res = await fetch('/api/v1/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(plan),
  })
  if (!res.ok) throw new Error('Failed to save workout')
  return res.json()
}

export async function shareWorkout(id: string): Promise<{ share_token: string }> {
  const res = await fetch(`/api/v1/workouts/${id}/share`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to share workout')
  return res.json()
}

export async function deleteWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/v1/workouts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete workout')
}

export async function subscribeWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/v1/workouts/${id}/subscribe`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to subscribe')
}

export async function unsubscribeWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/v1/workouts/${id}/subscribe`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to unsubscribe')
}
