import { useEffect, useState } from 'react'
import { listRecipes } from '../api/recipes'
import type { Paginate, Recipe } from '../types/api'

// What we remember about the last finished request. `key` says which request it answered.
interface Result {
  key: string
  data?: Paginate<Recipe>
  error?: Error
}

export interface RecipesState {
  data: Paginate<Recipe> | null
  error: Error | null
  loading: boolean
}

export function useRecipes(page: number, tagId: number | undefined): RecipesState {
  // Identifies the request that the current page/tag asks for.
  const key = `${page}:${tagId ?? ''}`
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    // Every run of this effect has its own `ignore`. The cleanup below flips it when page/tag
    // change (or the component unmounts) before the response arrives. Without it, a slow response
    // for page 2 could arrive after the one for page 3 and overwrite it (a "race condition").
    let ignore = false

    listRecipes(page, tagId).then(
      (data) => {
        if (!ignore) setResult({ key, data })
      },
      (error: unknown) => {
        if (!ignore) setResult({ key, error: error instanceof Error ? error : new Error(String(error)) })
      },
    )

    return () => {
      ignore = true
    }
  }, [key, page, tagId])

  // `loading` is derived, not stored: it is true while the saved answer belongs to another request.
  // This also means we never call setState synchronously inside the effect.
  const answered = result?.key === key
  return {
    // The previous page stays visible (dimmed) while the next one loads, instead of flashing empty.
    data: result?.data ?? null,
    error: answered ? (result.error ?? null) : null,
    loading: !answered,
  }
}
