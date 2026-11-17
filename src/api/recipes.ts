import type { Paginate, Recipe, RecipeInput } from '../types/api'
import { request } from './client'

// Page of the catalog (9 per page), optionally filtered by tag id.
export function listRecipes(page = 1, tagId?: number): Promise<Paginate<Recipe>> {
  // URLSearchParams builds and escapes the query string; the tag is only added when there is one.
  const params = new URLSearchParams({ page: String(page) })
  if (tagId !== undefined) {
    params.set('tag', String(tagId))
  }

  return request<Paginate<Recipe>>('GET', `/api/recipes?${params}`)
}

export function listRecentRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('GET', '/api/recipes/recent')
}

export function getRecipe(id: number): Promise<Recipe> {
  return request<Recipe>('GET', `/api/recipes/${id}`)
}

export function createRecipe(input: RecipeInput): Promise<Recipe> {
  return request<Recipe>('POST', '/api/recipes', input)
}

// PUT replaces the whole recipe: the API requires every field.
export function updateRecipe(id: number, input: RecipeInput): Promise<Recipe> {
  return request<Recipe>('PUT', `/api/recipes/${id}`, input)
}

export function deleteRecipe(id: number): Promise<void> {
  return request<void>('DELETE', `/api/recipes/${id}`)
}

// The photo goes in its own request (multipart), after the recipe exists. The field must be "image".
export function uploadRecipeImage(id: number, file: File): Promise<Recipe> {
  const form = new FormData()
  form.append('image', file)

  return request<Recipe>('POST', `/api/recipes/${id}/image`, form)
}
