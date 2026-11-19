import { useState, type FormEvent } from 'react'
import type { FieldErrors } from '../api/client'
import type { Difficulty, Recipe, RecipeInput, Tag } from '../types/api'

interface Props {
  // The recipe being edited, or undefined when creating a new one.
  recipe?: Recipe
  tags: Tag[]
  submitting: boolean
  // Error of the whole request (not tied to a field), and errors by field name (422).
  formError: string | null
  fieldErrors: FieldErrors
  onSubmit: (input: RecipeInput, photo: File | null) => void
  onCancel: () => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

// Presentational: it owns the typing state of the inputs; the page decides what saving means.
export function RecipeForm({ recipe, tags, submitting, formError, fieldErrors, onSubmit, onCancel }: Props) {
  // Controlled inputs. The number is kept as text while typing ("" is a valid in-between state).
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [prepTime, setPrepTime] = useState(recipe === undefined ? '' : String(recipe.prepTimeMinutes))
  const [difficulty, setDifficulty] = useState<Difficulty>(recipe?.difficulty ?? 'easy')
  const [tagIds, setTagIds] = useState<number[]>(recipe?.tags.map((tag) => tag.id) ?? [])
  const [photo, setPhoto] = useState<File | null>(null)

  function toggleTag(id: number) {
    // Never mutate state: build a new array.
    setTagIds((current) => (current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(
      { title: title.trim(), description: description.trim(), prepTimeMinutes: Number(prepTime), difficulty, tags: tagIds },
      photo,
    )
  }

  const currentImage = recipe?.imageUrl ?? null

  // `noValidate`: the browser's own bubbles are off, so every rule is checked by the server and shown
  // in the same place (next to its field).
  return (
    <form className="recipe-form" onSubmit={handleSubmit} noValidate>
      <label>
        Title
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={'title' in fieldErrors} />
        <FieldError message={fieldErrors.title} />
      </label>

      <label>
        Description
        <textarea
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={'description' in fieldErrors}
        />
        <FieldError message={fieldErrors.description} />
      </label>

      <label>
        Preparation time (minutes)
        <input
          type="number"
          min={1}
          max={1440}
          value={prepTime}
          onChange={(event) => setPrepTime(event.target.value)}
          aria-invalid={'prepTimeMinutes' in fieldErrors}
        />
        <FieldError message={fieldErrors.prepTimeMinutes} />
      </label>

      <label>
        Difficulty
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          {DIFFICULTIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors.difficulty} />
      </label>

      <fieldset>
        <legend>Tags</legend>
        <div className="tag-options">
          {tags.map((tag) => (
            <label key={tag.id} className="check">
              <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
              {tag.name}
            </label>
          ))}
        </div>
        <FieldError message={fieldErrors.tags} />
      </fieldset>

      <label>
        {currentImage === null ? 'Photo' : 'Photo (choose a file to replace the current one)'}
        {currentImage !== null && <img className="form-photo" src={currentImage} alt="Current photo" />}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
        <FieldError message={fieldErrors.image} />
      </label>

      {formError !== null && (
        <p className="message message--error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message: string | undefined }) {
  return message === undefined ? null : (
    <span className="field-error" role="alert">
      {message}
    </span>
  )
}
