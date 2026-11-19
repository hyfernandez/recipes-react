import { Link, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { useRecipe } from '../hooks/useRecipe'
import { parsePositiveInt } from '../utils/parsePositiveInt'

export function RecipeDetailPage() {
  // useParams returns what the route pattern captured: path="/recipes/:id" -> { id: '12' }.
  const { id } = useParams()
  const recipeId = parsePositiveInt(id)

  // Hooks cannot be called conditionally, so the validation lives here and the hook is used in a
  // child component that is only rendered when the id is valid.
  if (recipeId === undefined) {
    return <NotFound />
  }

  return <RecipeDetail id={recipeId} />
}

function RecipeDetail({ id }: { id: number }) {
  const { recipe, error, loading } = useRecipe(id)

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

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        ← Back to the catalog
      </Link>

      {recipe.imageUrl === null ? (
        <div className="detail-image card-image--empty">No photo</div>
      ) : (
        <img className="detail-image" src={recipe.imageUrl} alt={recipe.title} />
      )}

      <h1>{recipe.title}</h1>

      <p className="card-meta">
        <span>{recipe.prepTimeMinutes} min</span>
        <DifficultyBadge difficulty={recipe.difficulty} />
        <span>Added {new Date(recipe.createdAt).toLocaleDateString()}</span>
      </p>

      {recipe.tags.length > 0 && (
        <ul className="chips">
          {recipe.tags.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
      )}

      <p className="detail-description">{recipe.description}</p>
    </article>
  )
}

function NotFound() {
  return (
    <p className="message">
      Recipe not found. <Link to="/">Back to the catalog</Link>
    </p>
  )
}
