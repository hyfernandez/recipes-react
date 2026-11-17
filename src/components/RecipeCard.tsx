import { Link } from 'react-router'
import type { Recipe } from '../types/api'
import { DifficultyBadge } from './DifficultyBadge'

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
          <DifficultyBadge difficulty={recipe.difficulty} />
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
