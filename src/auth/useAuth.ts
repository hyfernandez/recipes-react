import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (value === null) {
    // A programming mistake (a component outside <AuthProvider>), better to fail loudly.
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return value
}
