import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import { fetchMyWorkouts, deleteWorkout, shareWorkout, type WorkoutSummary } from '../api/savedWorkouts'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function MyWorkoutsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: workouts, isLoading } = useQuery<WorkoutSummary[]>({
    queryKey: ['my-workouts'],
    queryFn: fetchMyWorkouts,
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-workouts'] }),
  })

  const shareMutation = useMutation({
    mutationFn: shareWorkout,
  })

  const [shareLink, setShareLink] = useState<string | null>(null)

  async function handleShare(id: string) {
    const result = await shareMutation.mutateAsync(id)
    const link = `${window.location.origin}/shared/${result.share_token}`
    setShareLink(link)
    await navigator.clipboard.writeText(link).catch(() => {})
    queryClient.invalidateQueries({ queryKey: ['my-workouts'] })
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Sign in to see your saved workouts.</p>
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </div>
    )
  }

  if (isLoading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>

      {shareLink && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <p className="font-medium text-green-800">Share link copied!</p>
          <p className="text-green-700 break-all">{shareLink}</p>
          <button onClick={() => setShareLink(null)} className="text-green-600 hover:underline text-xs mt-1">Dismiss</button>
        </div>
      )}

      {(!workouts || workouts.length === 0) ? (
        <div className="text-center py-12 text-gray-500">
          <p>No workouts yet. <Link to="/generate" className="text-blue-600 hover:underline">Generate</Link> or <Link to="/create" className="text-blue-600 hover:underline">create</Link> one!</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {workouts.map((w) => (
            <li key={w.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link to={`/my-workouts`} className="font-medium text-gray-900 hover:text-blue-600">
                  {w.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {w.total_meters}m
                  {!w.is_owner && <span className="ml-2 text-blue-600">(subscribed)</span>}
                  {w.is_public && w.is_owner && <span className="ml-2 text-green-600">(shared)</span>}
                </p>
              </div>
              <div className="flex gap-2">
                {w.is_owner && !w.is_public && (
                  <button
                    onClick={() => handleShare(w.id)}
                    className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Share
                  </button>
                )}
                {w.is_owner && (
                  <button
                    onClick={() => deleteMutation.mutate(w.id)}
                    className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
