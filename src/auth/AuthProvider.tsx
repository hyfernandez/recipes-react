import { useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth'
import { ApiError } from '../api/client'
import type { User } from '../types/api'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  // null = we have not heard from the server yet; { user: null } = we know nobody is logged in.
  const [session, setSession] = useState<{ user: User | null } | null>(null)

  // On every page load React starts empty and cannot read the HttpOnly session cookie, so it asks
  // the server who is logged in. The browser attaches the cookie to the request by itself.
  useEffect(() => {
    let ignore = false

    fetchCurrentUser().then(
      (user) => {
        if (!ignore) setSession({ user })
      },
      // The server is unreachable or failed: we cannot confirm a session, so we treat it as logged out.
      () => {
        if (!ignore) setSession({ user: null })
      },
    )

    return () => {
      ignore = true
    }
  }, [])

  async function login(email: string, password: string) {
    // Errors (401: wrong credentials) are not caught here: the login form decides what to show.
    const user = await apiLogin(email, password)
    setSession({ user })
  }

  async function logout() {
    try {
      await apiLogout()
    } catch (error) {
      // The server answers 401 to a logout without a session (e.g. it expired meanwhile). The goal
      // "be logged out" is already met, so that is not an error. Anything else is.
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error
      }
    }
    setSession({ user: null })
  }

  const user = session?.user ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: session === null,
        isAdmin: user?.roles.includes('ROLE_ADMIN') ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
