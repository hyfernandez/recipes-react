import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, type FieldErrors } from '../api/client'
import { createRecipe, updateRecipe, uploadRecipeImage } from '../api/recipes'
import { useSessionExpired } from '../auth/useSessionExpired'
import { RecipeForm } from '../components/RecipeForm'
import { useRecipe } from '../hooks/useRecipe'
import { useTags } from '../hooks/useTags'
import type { Recipe, RecipeInput } from '../types/api'
import { parsePositiveInt } from '../utils/parsePositiveInt'

// /admin/recipes/new
export function RecipeCreatePage() {
  return (
    <section className="form-page">
      <h1>New recipe</h1>
      <RecipeEditor />
    </section>
  )
}

// /admin/recipes/:id/edit
export function RecipeEditPage() {
  const { id } = useParams()
  const recipeId = parsePositiveInt(id)

  if (recipeId === undefined) {
    return <NotFound />
  }

  return <EditLoader id={recipeId} />
}

function EditLoader({ id }: { id: number }) {
  const { recipe, error, loading } = useRecipe(id)
  const location = useLocation()

  if (error !== null) {
    return error instanceof ApiError && error.status === 404 ? (
      <NotFound />
    ) : (
      <p className="message message--error" role="alert">
        Could not load the recipe.
      </p>
    )
  }

  if (loading || recipe === null) {
    return <p className="message">Loading recipe…</p>
  }

  // Set by the create flow when the recipe was saved but its photo could not be uploaded.
  const state: unknown = location.state
  const notice = typeof state === 'object' && state !== null && 'notice' in state && typeof state.notice === 'string' ? state.notice : null

  return (
    <section className="form-page">
      <h1>Edit recipe</h1>
      {notice !== null && (
        <p className="message message--error" role="alert">
          {notice}
        </p>
      )}
      {/* key: if the user goes to another recipe, the form starts again with its values. */}
      <RecipeEditor key={recipe.id} recipe={recipe} />
    </section>
  )
}

// Saves a recipe in two requests: the JSON first, then the photo (it needs the recipe's id).
function RecipeEditor({ recipe }: { recipe?: Recipe }) {
  const navigate = useNavigate()
  const tags = useTags()
  const handleExpired = useSessionExpired()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(input: RecipeInput, photo: File | null) {
    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})

    let saved: Recipe
    try {
      saved = recipe === undefined ? await createRecipe(input) : await updateRecipe(recipe.id, input)
    } catch (caught) {
      if (!handleExpired(caught)) {
        if (caught instanceof ApiError && caught.status === 422) {
          setFieldErrors(caught.fieldErrors)
        } else if (caught instanceof ApiError && caught.status === 403) {
          setFormError('You can only edit your own recipes.')
        } else if (caught instanceof ApiError && caught.status === 404) {
          setFormError('That recipe no longer exists.')
        } else {
          setFormError('Could not save the recipe. Try again in a moment.')
        }
      }
      setSubmitting(false)
      return
    }

    if (photo !== null) {
      try {
        await uploadRecipeImage(saved.id, photo)
      } catch (caught) {
        if (handleExpired(caught)) {
          setSubmitting(false)
          return
        }
        const reason =
          caught instanceof ApiError && caught.status === 422 ? (caught.fieldErrors.image ?? 'The photo is not valid.') : 'The upload failed.'
        const message = `The recipe was saved, but its photo was not: ${reason}`

        if (recipe === undefined) {
          // The recipe exists now: go to its edit page so a retry updates it instead of duplicating it.
          navigate(`/admin/recipes/${saved.id}/edit`, { replace: true, state: { notice: message } })
        } else {
          setFormError(message)
          setSubmitting(false)
        }
        return
      }
    }

    navigate('/admin')
  }

  return (
    <RecipeForm
      recipe={recipe}
      tags={tags}
      submitting={submitting}
      formError={formError}
      fieldErrors={fieldErrors}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin')}
    />
  )
}

function NotFound() {
  return (
    <p className="message">
      Recipe not found. <Link to="/admin">Back to the list</Link>
    </p>
  )
}
