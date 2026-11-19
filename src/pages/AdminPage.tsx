import { useAuth } from '../auth/useAuth'

// Placeholder: the recipe management (table, create, edit, delete) arrives in the next step.
export function AdminPage() {
  const { user } = useAuth()

  return (
    <section>
      <h1>Admin</h1>
      <p>Logged in as {user?.email}.</p>
    </section>
  )
}
