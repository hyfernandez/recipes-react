import { Link, useSearchParams } from 'react-router'
import { ApiError } from '../api/client'
import { Pagination } from '../components/Pagination'
import { RecipeCard } from '../components/RecipeCard'
import { TagFilter } from '../components/TagFilter'
import { useRecipes } from '../hooks/useRecipes'
import { useTags } from '../hooks/useTags'

// Query-string values are text a user can edit by hand (?page=abc, ?page=-3): only a positive
// integer is accepted, anything else counts as "not given".
function parsePositiveInt(value: string | null): number | undefined {
  if (value === null) {
    return undefined
  }
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : undefined
}

export function CatalogPage() {
  // The page and the tag live in the URL (/?page=2&tag=3), not in component state, so the
  // browser's back button, reload and shared links all keep working.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePositiveInt(searchParams.get('page')) ?? 1
  const tagId = parsePositiveInt(searchParams.get('tag'))

  const { data, error, loading } = useRecipes(page, tagId)
  const tags = useTags()

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams)
    if (next === 1) {
      params.delete('page')
    } else {
      params.set('page', String(next))
    }
    setSearchParams(params)
    window.scrollTo({ top: 0 })
  }

  function selectTag(next: number | undefined) {
    const params = new URLSearchParams(searchParams)
    // Changing the filter starts again from the first page.
    params.delete('page')
    if (next === undefined) {
      params.delete('tag')
    } else {
      params.set('tag', String(next))
    }
    setSearchParams(params)
  }

  return (
    <section>
      <TagFilter tags={tags} selectedId={tagId} onSelect={selectTag} />

      {error !== null && (
        <p className="message message--error" role="alert">
          {error instanceof ApiError && error.status === 404 ? 'That tag does not exist.' : 'Could not load the recipes.'}
        </p>
      )}

      {error === null && data === null && <p className="message">Loading recipes…</p>}

      {error === null && data !== null && (
        <>
          {data.items.length === 0 ? (
            // e.g. ?page=99: there is nothing to paginate, so the only way out is the catalog start.
            <p className="message">
              No recipes here. <Link to="/">Back to the catalog</Link>
            </p>
          ) : (
            <>
              <div className={loading ? 'grid grid--loading' : 'grid'} aria-busy={loading}>
                {data.items.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
            </>
          )}
        </>
      )}
    </section>
  )
}
