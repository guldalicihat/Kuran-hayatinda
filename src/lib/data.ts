import type { Chapter, Content, ContentIndex, MealMap, SearchRow, Surah } from './types'

const base = import.meta.env.BASE_URL
const cache = new Map<string, Promise<unknown>>()

function get<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    cache.set(path, fetch(base + path).then(r => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json() }))
  }
  return cache.get(path) as Promise<T>
}

export const loadChapters = () => get<Chapter[]>('data/chapters.json')
export const loadSurah = (n: number) => get<Surah>(`data/surah/${n}.json`)
export const loadSearch = () => get<SearchRow[]>('data/search.json')
export const loadContentIndex = () => get<ContentIndex>('content/index.json').catch(() => ({} as ContentIndex))
export const loadMeals = (n: number) => get<MealMap>(`data/meal/${n}.json`).catch(() => ({} as MealMap))
export const loadContent = (s: number, a: number) => get<Content>(`content/${s}/${a}.json`)

export function parseRef(ref: string): [number, number] | null {
  const m = ref.match(/^(\d+):(\d+)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}
