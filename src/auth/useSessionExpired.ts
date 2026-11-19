import { ApiError } from '../api/client'
import { useAuth } from './useAuth'

// A write can answer 401 in the middle of a session (it expired on the server) while the UI still
// believes there is a user. Returns a function: give it a caught error; if it was a 401 it clears
// the local session (ProtectedRoute then sends the user to /login and back here afterwards) and
// returns true, so the caller can stop handling the error.
export function useSessionExpired(): (error: unknown) => boolean {
  const { logout } = useAuth()

  return (error) => {
    if (error instanceof ApiError && error.status === 401) {
      // logout() treats the server's 401 as "already logged out" and clears the local session.
      void logout().catch(() => {})
      return true
    }

    return false
  }
}
