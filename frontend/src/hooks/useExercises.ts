import { useQuery } from '@tanstack/react-query'
import { fetchExercises, type Exercise } from '../api/exercises'

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  })
}
