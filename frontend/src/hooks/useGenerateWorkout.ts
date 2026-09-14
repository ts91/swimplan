import { useMutation } from '@tanstack/react-query'
import { generateWorkout, type GenerateRequest, type WorkoutPlan } from '../api/workouts'

export function useGenerateWorkout() {
  return useMutation<WorkoutPlan, Error, GenerateRequest>({
    mutationFn: generateWorkout,
  })
}
