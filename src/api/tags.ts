import type { Tag } from '../types/api'
import { request } from './client'

export function listTags(): Promise<Tag[]> {
  return request<Tag[]>('GET', '/api/tags')
}
