// What the pager shows: page numbers and, where pages are skipped, a gap marker.
// Always the first and last page plus the current one with `around` neighbours on each side:
// pageItems(6, 12) -> [1, 'gap', 5, 6, 7, 'gap', 12]
export type PageItem = number | 'gap'

export function pageItems(current: number, total: number, around = 1): PageItem[] {
  const items: PageItem[] = []
  let last = 0

  for (let page = 1; page <= total; page++) {
    const visible = page === 1 || page === total || Math.abs(page - current) <= around
    if (!visible) {
      continue
    }
    // A single skipped page is shown as the page itself: a gap marker would hide nothing useful.
    if (page - last === 2) {
      items.push(page - 1)
    } else if (page - last > 2) {
      items.push('gap')
    }
    items.push(page)
    last = page
  }

  return items
}
