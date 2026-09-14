import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Layout() {
  const { user, loading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Swimplan
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/workouts/new" className="hover:underline">
              New Workout
            </Link>
            <Link to="/exercises" className="hover:underline">
              Exercises
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link to="/my-workouts" className="hover:underline">
                      My Workouts
                    </Link>
                    <div className="flex items-center gap-2 ml-2">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-7 h-7 rounded-full border border-white/30"
                        />
                      )}
                      <button
                        onClick={logout}
                        className="text-sm text-white/80 hover:text-white hover:underline"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-md bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
