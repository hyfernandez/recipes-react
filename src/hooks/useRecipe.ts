import { useEffect, useState } from 'react'
import { getRecipe } from '../api/recipes'
import type { Recipe } from '../types/api'

// The last finished request. `id` says which recipe it was for.
interface Result {
  id: number
  recipe?: Recipe
  error?: Error
}

export interface RecipeState {
  recipe: Recipe | null
  error: Error | null
  loading: boolean
}

// Same pattern as useRecipes, for a single recipe. See that hook for why `ignore` exists and why
// `loading` is derived instead of stored.
export function useRecipe(id: number): RecipeState {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let ignore = false

    getRecipe(id).then(
      (recipe) => {
        if (!ignore) setResult({ id, recipe })
      },
      (error: unknown) => {
        if (!ignore) setResult({ id, error: error instanceof Error ? error : new Error(String(error)) })
      },
    )

    return () => {
      ignore = true
    }
  }, [id])

  // Unlike the catalog, the previous result is NOT kept while loading: showing recipe 3 under
  // the URL of recipe 4 would be wrong. An answer only counts if it is for the current id.
  const answered = result?.id === id
  return {
    recipe: answered ? (result.recipe ?? null) : null,
    error: answered ? (result.error ?? null) : null,
    loading: !answered,
  }
}
