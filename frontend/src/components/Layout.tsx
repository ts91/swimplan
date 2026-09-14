import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Swimplan
          </Link>
          <div className="flex gap-4">
            <Link to="/create" className="hover:underline">
              Create
            </Link>
            <Link to="/generate" className="hover:underline">
              Generate
            </Link>
            <Link to="/exercises" className="hover:underline">
              Exercises
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
