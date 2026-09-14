import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import { saveWorkout } from '../api/savedWorkouts'
import type { WorkoutPlan } from '../api/workouts'
import { Link } from 'react-router-dom'

export function SaveWorkoutButton({ plan }: { plan: WorkoutPlan }) {
  const { user } = useAuth()
  const mutation = useMutation({
    mutationFn: () => saveWorkout(plan),
  })

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-block rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        Sign in to save
      </Link>
    )
  }

  if (mutation.isSuccess) {
    return <span className="text-sm text-green-600 font-medium">Saved!</span>
  }

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:opacity-50"
    >
      {mutation.isPending ? 'Saving...' : 'Save Workout'}
    </button>
  )
}
