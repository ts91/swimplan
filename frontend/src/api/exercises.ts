export interface Exercise {
  id: string
  name: string
  category: string
  phase: string
  description: string
  distance: number
}

export async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch('/api/v1/exercises')
  if (!res.ok) {
    throw new Error('Failed to fetch exercises')
  }
  return res.json()
}
