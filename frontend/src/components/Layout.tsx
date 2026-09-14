import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'

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
  const { theme, toggleTheme } = useTheme()
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow">
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
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-30">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => { logout(); setMenuOpen(false) }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            <button
              onClick={toggleTheme}
              className="ml-2 rounded-md p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
