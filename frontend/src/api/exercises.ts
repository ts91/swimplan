export interface Equipment {
  id: string
  name: string
  abbrev: string
}

export interface Exercise {
  id: string
  name: string
  abbrev: string
  category: string
  description: string
  equipment: Equipment[]
}

export async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch('/api/v1/exercises')
  if (!res.ok) {
    throw new Error('Failed to fetch exercises')
  }
  return res.json()
}
