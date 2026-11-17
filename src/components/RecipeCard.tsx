import { Link } from 'react-router'
import type { Difficulty, Recipe } from '../types/api'

// Record<Difficulty, string> forces one label per difficulty: if the backend adds a value to the
// Difficulty type, the compiler flags this object until the label is added.
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

interface Props {
  recipe: Recipe
}

export function RecipeCard({ recipe }: Props) {
  return (
    <article className="card">
      {recipe.imageUrl === null ? (
        <div className="card-image card-image--empty">No photo</div>
      ) : (
        <img className="card-image" src={recipe.imageUrl} alt={recipe.title} loading="lazy" />
      )}

      <div className="card-body">
        <h2>
          <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
        </h2>

        <p className="card-meta">
          <span>{recipe.prepTimeMinutes} min</span>
          <span className={`badge badge--${recipe.difficulty}`}>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
        </p>

        {recipe.tags.length > 0 && (
          <ul className="chips">
            {recipe.tags.map((tag) => (
              <li key={tag.id}>{tag.name}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
