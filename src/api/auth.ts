import type { User } from '../types/api'
import { ApiError, request } from './client'

export function login(email: string, password: string): Promise<User> {
  return request<User>('POST', '/api/login', { email, password })
}

export function logout(): Promise<void> {
  return request<void>('POST', '/api/logout')
}

// "Is there a session?" is a normal question, not a failure: a 401 here means "nobody", so it
// returns null instead of throwing. Any other error (500, network...) is still thrown.
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await request<User>('GET', '/api/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}
