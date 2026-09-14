import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

function Avatar({ src, name, onClick }: { src: string; name: string; onClick?: () => void }) {
  const [failed, setFailed] = useState(false)
  const initial = (name || '?').charAt(0).toUpperCase()

  const classes = 'flex items-center justify-center w-8 h-8 rounded-full border border-white/30 cursor-pointer hover:ring-2 hover:ring-white/50 transition'

  if (!src || failed) {
    return (
      <button onClick={onClick} className={`${classes} bg-white/20 text-sm font-bold text-white`}>
        {initial}
      </button>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full"
        onError={() => setFailed(true)}
      />
    </button>
  )
}

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-1 text-sm font-medium transition ${
        active
          ? 'bg-gray-50 text-blue-600'
          : 'text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )
}

export function Layout() {
  const { user, loading, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Swimplan
          </Link>
          <div className="flex items-center gap-1">
            <NavItem to="/workouts/new" label="New Workout" active={pathname.startsWith('/workouts')} />
            <NavItem to="/exercises" label="Exercises" active={pathname.startsWith('/exercises')} />
            {!loading && (
              <>
                {user ? (
                  <>
                    <NavItem to="/my-workouts" label="My Workouts" active={pathname.startsWith('/my-workouts')} />
                    <div ref={menuRef} className="relative ml-2">
                      <Avatar
                        src={user.avatar_url}
                        name={user.name}
                        onClick={() => setMenuOpen((v) => !v)}
                      />
                      {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-30">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/my-workouts"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              My Workouts
                            </Link>
                            <button
                              onClick={() => { logout(); setMenuOpen(false) }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-md bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30 ml-2"
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
