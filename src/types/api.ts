// Types that describe the JSON the Symfony API sends and receives.
// They only exist at compile time: TypeScript checks them and then erases them,
// so they cost nothing at runtime (and do not validate the real response).

// An `interface` describes the shape of an object: its field names and their types.
// This one mirrors an item of GET /api/tags: {"id": 6, "name": "Breakfast"}
export interface Tag {
  id: number
  name: string
}

// A union of literal strings: the value can only be one of these three (like a PHP enum).
// They are the values of the backend enum App\Enum\Difficulty.
export type Difficulty = 'hard' | 'medium' | 'easy'

// A recipe as the API returns it (GET /api/recipes, /api/recipes/{id}).
export interface Recipe {
  id: number
  title: string
  description: string
  prepTimeMinutes: number
  difficulty: Difficulty
  // JSON has no date type: dates arrive as ISO text ("2026-11-05T22:12:24+00:00").
  createdAt: string
  // Always present, but null when the recipe has no photo (`string | null`, not `imageUrl?`).
  imageUrl: string | null
  tags: Tag[]
}

// Generic: T is a placeholder filled in at the use site. Paginate<Recipe> is a page of
// recipes. Shape of GET /api/recipes: {"items": [...], "page": 1, "perPage": 9, ...}
export interface Paginate<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  pages: number
}

// The logged-in user: answer of POST /api/login and GET /api/me.
export interface User {
  email: string
  roles: string[]
}

// What we SEND in POST/PUT /api/recipes. It is not the same shape as Recipe:
// - id, createdAt and imageUrl are not sent (the server sets them; the photo has its own endpoint);
// - tags is a list of tag IDS, not Tag objects.
// `extends Omit<...>` copies Recipe without those fields; an interface cannot redefine an inherited
// field with another type, which is why `tags` is removed first and declared again below.
export interface RecipeInput extends Omit<Recipe, 'id' | 'createdAt' | 'imageUrl' | 'tags'> {
  tags: number[]
}

// One field error inside a 422 response (Symfony validation).
export interface Violation {
  propertyPath: string
  title: string
}

// Body of a 422 response. The API sends more fields; only the ones we read are declared.
export interface ValidationErrorBody {
  title: string
  status: number
  detail: string
  violations: Violation[]
}