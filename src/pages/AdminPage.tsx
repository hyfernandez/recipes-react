import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ApiError } from '../api/client'
import { deleteRecipe } from '../api/recipes'
import { Pagination } from '../components/Pagination'
import { useSessionExpired } from '../auth/useSessionExpired'
import { useRecipes } from '../hooks/useRecipes'
import { parsePositiveInt } from '../utils/parsePositiveInt'

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePositiveInt(searchParams.get('page')) ?? 1

  // Bumped after a delete to request the list again.
  const [version, setVersion] = useState(0)
  const { data, error, loading } = useRecipes(page, undefined, version)

  // Delete is two steps: the first click only marks the row, the second one confirms.
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const handleExpired = useSessionExpired()

  function goToPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
  }

  async function confirmDelete(id: number) {
    setDeletingId(id)
    setDeleteError(null)

    try {
      await deleteRecipe(id)
      setConfirmingId(null)
      if (data !== null && data.items.length === 1 && page > 1) {
        // It was the last recipe of this page: the page no longer exists, go back one.
        goToPage(page - 1)
      } else {
        setVersion((current) => current + 1)
      }
    } catch (caught) {
      if (handleExpired(caught)) {
        return
      }
      setConfirmingId(null)
      if (caught instanceof ApiError && caught.status === 403) {
        setDeleteError('You can only delete your own recipes.')
      } else if (caught instanceof ApiError && caught.status === 404) {
        // Someone else deleted it already: the list is stale, reload it.
        setDeleteError('That recipe no longer exists.')
        setVersion((current) => current + 1)
      } else {
        setDeleteError('Could not delete the recipe. Try again in a moment.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <div className="admin-head">
        <h1>Recipes</h1>
        <Link to="/admin/recipes/new" className="button">
          New recipe
        </Link>
      </div>

      {deleteError !== null && (
        <p className="message message--error" role="alert">
          {deleteError}
        </p>
      )}

      {error !== null && (
        <p className="message message--error" role="alert">
          Could not load the recipes.
        </p>
      )}

      {error === null && data === null && <p className="message">Loading recipes…</p>}

      {error === null && data !== null && (
        <>
          {data.items.length === 0 ? (
            <p className="message">
              No recipes here. <Link to="/admin/recipes/new">Create the first one</Link>
            </p>
          ) : (
            <div className="table-wrap">
              <table className={loading ? 'table table--loading' : 'table'}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Time</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th>
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((recipe) => (
                    <tr key={recipe.id}>
                      <td>
                        <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
                      </td>
                      <td>{recipe.prepTimeMinutes} min</td>
                      <td>{recipe.difficulty}</td>
                      <td>{recipe.tags.map((tag) => tag.name).join(', ')}</td>
                      <td className="row-actions">
                        {confirmingId === recipe.id ? (
                          <>
                            <span>Delete “{recipe.title}”?</span>
                            <button
                              type="button"
                              className="danger"
                              disabled={deletingId === recipe.id}
                              onClick={() => confirmDelete(recipe.id)}
                            >
                              {deletingId === recipe.id ? 'Deleting…' : 'Yes, delete'}
                            </button>
                            <button type="button" disabled={deletingId === recipe.id} onClick={() => setConfirmingId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <Link to={`/admin/recipes/${recipe.id}/edit`}>Edit</Link>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null)
                                setConfirmingId(recipe.id)
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
        </>
      )}
    </section>
  )
}
