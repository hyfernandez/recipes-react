import { createContext } from 'react'
import type { User } from '../types/api'

export interface AuthContextValue {
  // The logged-in user, or null when nobody is (or while we still do not know: see `loading`).
  user: User | null
  // True only until the first answer of GET /api/me arrives.
  loading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// A context is a "channel" any component below the Provider can read, without passing the value
// down through every component in between (prop drilling). The default is null so that using the
// context outside the Provider is detected (see useAuth).
export const AuthContext = createContext<AuthContextValue | null>(null)
