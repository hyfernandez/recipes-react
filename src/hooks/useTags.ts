import { useEffect, useState } from 'react'
import { listTags } from '../api/tags'
import type { Tag } from '../types/api'

// Tags rarely change, so they are loaded once when the component appears.
// If the request fails the filter simply is not shown: the catalog still works without it.
export function useTags(): Tag[] {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    let ignore = false

    listTags().then(
      (data) => {
        if (!ignore) setTags(data)
      },
      () => {},
    )

    return () => {
      ignore = true
    }
  }, [])

  return tags
}
