import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import { fetchMyWorkouts, deleteWorkout, shareWorkout, type WorkoutSummary } from '../api/savedWorkouts'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Badge } from '../components/ui'

export function MyWorkoutsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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

  async function handleShare(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const result = await shareMutation.mutateAsync(id)
    const link = `${window.location.origin}/shared/${result.share_token}`
    setShareLink(link)
    await navigator.clipboard.writeText(link).catch(() => {})
    queryClient.invalidateQueries({ queryKey: ['my-workouts'] })
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  function handleRowClick(id: string) {
    navigate(`/workouts/new?load=${id}`)
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
      <div className="flex items-center justify-end">
        <Button onClick={() => navigate('/workouts/new')}>New Workout</Button>
      </div>

      {shareLink && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <p className="font-medium text-green-800">Share link copied!</p>
          <p className="text-green-700 break-all">{shareLink}</p>
          <button onClick={() => setShareLink(null)} className="text-green-600 hover:underline text-xs mt-1">Dismiss</button>
        </div>
      )}

      {(!workouts || workouts.length === 0) ? (
        <div className="text-center py-12 text-gray-500">
          <p>No workouts yet. <Link to="/workouts/new" className="text-blue-600 hover:underline">Create one</Link>!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workouts.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => handleRowClick(w.id)}
                  className="hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.total_meters}m</td>
                  <td className="px-4 py-3 text-sm">
                    {!w.is_owner && <Badge color="blue">Subscribed</Badge>}
                    {w.is_public && w.is_owner && <Badge color="green">Shared</Badge>}
                    {!w.is_public && w.is_owner && <Badge color="gray">Private</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(w.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {w.is_owner && !w.is_public && (
                        <Button variant="secondary" size="sm" onClick={(e) => handleShare(e, w.id)}>
                          Share
                        </Button>
                      )}
                      {w.is_owner && (
                        <Button variant="danger" size="sm" onClick={(e) => handleDelete(e, w.id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
