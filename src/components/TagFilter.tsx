import type { Tag } from '../types/api'

interface Props {
  tags: Tag[]
  selectedId: number | undefined
  // undefined means "all recipes".
  onSelect: (tagId: number | undefined) => void
}

export function TagFilter({ tags, selectedId, onSelect }: Props) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="filter" role="group" aria-label="Filter by tag">
      <button type="button" aria-pressed={selectedId === undefined} onClick={() => onSelect(undefined)}>
        All
      </button>
      {tags.map((tag) => (
        <button key={tag.id} type="button" aria-pressed={selectedId === tag.id} onClick={() => onSelect(tag.id)}>
          {tag.name}
        </button>
      ))}
    </div>
  )
}
