import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'

export function SiteHeader() {
  const { user, loading, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      // Leave first. If the session were cleared while still on /admin, ProtectedRoute would
      // redirect to /login before a navigate('/') placed after logout() could run.
      navigate('/')
      await logout()
    } catch {
      // The session could not be closed (network / server error): the user stays logged in, now on
      // the catalog, and can try again. Showing a message would need a notification system.
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          Recipes
        </Link>

        {/* Nothing is shown while we do not know the session yet, to avoid a "Log in" flash. */}
        {!loading && (
          <nav className="site-nav" aria-label="Account">
            {user === null ? (
              <Link to="/login">Log in</Link>
            ) : (
              <>
                {isAdmin && <Link to="/admin">Admin</Link>}
                <span className="site-user">{user.email}</span>
                <button type="button" onClick={handleLogout} disabled={loggingOut}>
                  Log out
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
