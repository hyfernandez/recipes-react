import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

// The router gives `location.state` the type `any`: it is checked here before being trusted.
// Only an internal path (starting with a single "/") is accepted, never an external URL.
function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    if (state.from.startsWith('/') && !state.from.startsWith('//')) {
      return state.from
    }
  }

  return '/admin'
}

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Controlled inputs: React owns the value (state) and updates it on every keystroke.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const target = redirectTarget(location.state)

  // Do not show the form until we know there is no session: a logged-in user who reloads this
  // page would see it flash before being redirected.
  if (loading) {
    return <p className="message">Loading…</p>
  }

  // Already logged in (or just became so): there is nothing to do here.
  if (user !== null) {
    return <Navigate to={target} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Without this the browser would submit the form and reload the page.
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await login(email, password)
      // No navigate() here: login() updates the session, the component re-renders and the
      // <Navigate> above takes the user to `target`.
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 401
          ? 'Invalid email or password.'
          : 'Could not log in. Try again in a moment.',
      )
      setSubmitting(false)
    }
  }

  return (
    <section className="login">
      <h1>Log in</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error !== null && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <button type="button" className="link-button" onClick={() => navigate('/')}>
        Back to the catalog
      </button>
    </section>
  )
}
