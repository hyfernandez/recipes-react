import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

// A "layout route": it renders no page of its own, it decides whether the routes nested inside
// it (the <Outlet />) can be shown.
//
// IMPORTANT: this only decides what the INTERFACE shows. Anyone can change JavaScript in their
// browser, so the real protection is in Symfony (access_control and RecipeVoter), which answers
// 401/403 no matter what React does.
export function ProtectedRoute() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  // Before the first /api/me answer we do not know yet: redirecting now would send a logged-in user
  // to the login page every time they reload.
  if (loading) {
    return <p className="message">Loading…</p>
  }

  if (user === null) {
    // Remember where the user wanted to go, so the login can send them back there.
    // `replace` swaps the history entry, so the Back button does not return to the protected page.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (!isAdmin) {
    return (
      <p className="message message--error" role="alert">
        Your account does not have access to this area.
      </p>
    )
  }

  return <Outlet />
}
