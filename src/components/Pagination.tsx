import { pageItems } from '../utils/pageItems'

interface Props {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>

      <ol className="pagination-pages">
        {pageItems(page, pages).map((item, index) =>
          item === 'gap' ? (
            // The position is the only identity a gap has; the list never reorders, so an index key is safe.
            <li key={`gap-${index}`} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                disabled={item === page}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>

      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
