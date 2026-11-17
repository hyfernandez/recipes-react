import type { ValidationErrorBody } from '../types/api'

// Field name -> message, e.g. { title: 'This value should not be blank.' }.
// A form uses it to show each error next to its input.
export type FieldErrors = Record<string, string>

// Every failed request (4xx / 5xx) becomes one of these, so the rest of the app has a single
// kind of error to catch and can read `status` (401, 403, 404, 422...) and `fieldErrors`.
export class ApiError extends Error {
  // Declared here, not in the constructor parameters: `erasableSyntaxOnly` forbids that shortcut.
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// The one place that calls fetch(). `T` is chosen by the caller: request<Tag[]>('GET', '/api/tags').
// `body` is a plain object (sent as JSON) or a FormData (sent as multipart, for the photo upload).
export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  let payload: BodyInit | undefined

  if (body instanceof FormData) {
    // No Content-Type here on purpose: the browser must write it itself, because the multipart
    // header carries a random "boundary" that separates the parts. Setting it by hand breaks the upload.
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const response = await fetch(path, {
    method,
    headers,
    body: payload,
    // Send (and accept) the session cookie. With the Vite proxy the origin is the same, so this
    // would work by default; it is explicit so the intent is clear and it keeps working if that changes.
    credentials: 'include',
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  // 204 No Content (e.g. logout, delete) has no body: calling response.json() would throw.
  if (response.status === 204) {
    return undefined as T
  }

  // fetch cannot know the type of the JSON; `as T` is our promise to the compiler, not a check.
  return (await response.json()) as T
}

async function toApiError(response: Response): Promise<ApiError> {
  // The body is not always JSON (e.g. a proxy error page): never let the parsing hide the real status.
  const data: unknown = await response.json().catch(() => null)

  if (response.status === 422 && isValidationError(data)) {
    const fieldErrors: FieldErrors = {}
    for (const violation of data.violations) {
      // Keep the first message of each field.
      if (!(violation.propertyPath in fieldErrors)) {
        fieldErrors[violation.propertyPath] = violation.title
      }
    }

    return new ApiError(422, data.detail, fieldErrors)
  }

  return new ApiError(response.status, messageFrom(data) ?? response.statusText)
}

// Type guard: the `data is ValidationErrorBody` return type tells the compiler that, inside an `if`
// where this returns true, `data` has that shape. It checks the minimum we rely on.
function isValidationError(data: unknown): data is ValidationErrorBody {
  return typeof data === 'object' && data !== null && 'violations' in data && Array.isArray(data.violations)
}

// Our own errors come as {"error": "..."}; Symfony's as {"detail": "..."}.
function messageFrom(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }
  if ('error' in data && typeof data.error === 'string') {
    return data.error
  }
  if ('detail' in data && typeof data.detail === 'string') {
    return data.detail
  }

  return null
}
