import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchSharedWorkout, subscribeWorkout } from '../api/savedWorkouts'
import { PlanDisplay } from '../components/PlanDisplay'
import { ExportSection } from '../components/ExportSection'
import { useAuth } from '../lib/auth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui'
import type { WorkoutPlan } from '../api/workouts'

export function SharedWorkoutPage() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuth()
  useDocumentTitle('Shared Workout')

  const { data: workout, isLoading, error } = useQuery({
    queryKey: ['shared-workout', token],
    queryFn: () => fetchSharedWorkout(token!),
    enabled: !!token,
  })

  const subscribeMutation = useMutation({
    mutationFn: () => subscribeWorkout(workout!.id),
  })

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Loading shared workout...</p>
  if (error || !workout) return <p className="text-red-600">Shared workout not found.</p>

  const plan: WorkoutPlan = {
    name: workout.name,
    total_meters: workout.total_meters,
    pool_length: workout.pool_length || 25,
    warmup: workout.warmup,
    main_set: workout.main_set,
    cooldown: workout.cooldown,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shared Workout</h1>
        {user && !subscribeMutation.isSuccess && (
          <Button onClick={() => subscribeMutation.mutate()} disabled={subscribeMutation.isPending}>
            {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
          </Button>
        )}
        {subscribeMutation.isSuccess && (
          <span className="text-sm text-green-600 font-medium">Subscribed!</span>
        )}
      </div>
      <PlanDisplay plan={plan} />
      <ExportSection plan={plan} />
    </div>
  )
}
