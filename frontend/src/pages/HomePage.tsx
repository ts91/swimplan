import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui'

export function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to="/my-workouts" replace />
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to Swimplan</h1>
      <p className="text-lg text-gray-600 max-w-lg">
        Build structured swimming workouts with ease. Generate random plans, craft your own, or find workouts shared by the community.
      </p>
      <Link to="/workouts/new">
        <Button className="px-6 py-3">Get Started</Button>
      </Link>
      <p className="text-sm text-gray-500">
        <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link> to save and share your workouts.
      </p>
    </div>
  )
}
