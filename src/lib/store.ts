// Cihazda saklanan kullanıcı verisi: etiketler, notlar, son okunan yer.
import { useCallback, useEffect, useState } from 'react'

export type TagMap = Record<string, string[]>      // "8:65" -> ["sabır", "cesaret"]
export type NoteMap = Record<string, string>       // "8:65" -> not metni
export interface LastRead { s: number; a: number; t: number }

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* yoksay */ }
  window.dispatchEvent(new CustomEvent('kh:store', { detail: key }))
}
function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    const h = (e: Event) => { if ((e as CustomEvent).detail === key) setV(read(key, fallback)) }
    window.addEventListener('kh:store', h); return () => window.removeEventListener('kh:store', h)
  }, [key, fallback])
  const set = useCallback((n: T) => { write(key, n); setV(n) }, [key])
  return [v, set]
}
const EMPTY_TAGS: TagMap = {}; const EMPTY_NOTES: NoteMap = {}

export function useTags() {
  const [tags, setTags] = useStored<TagMap>('kh:tags', EMPTY_TAGS)
  const toggle = (key: string, tag: string) => {
    const cur = tags[key] ?? []
    const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag]
    const n = { ...tags }; if (next.length) n[key] = next; else delete n[key]; setTags(n)
  }
  return { tags, toggle }
}
export function useNotes() {
  const [notes, setNotes] = useStored<NoteMap>('kh:notes', EMPTY_NOTES)
  const save = (key: string, text: string) => { const n = { ...notes }; if (text.trim()) n[key] = text; else delete n[key]; setNotes(n) }
  return { notes, save }
}
export function useLastRead() {
  const [last, setLast] = useStored<LastRead | null>('kh:last', null)
  const mark = (s: number, a: number) => setLast({ s, a, t: Date.now() })
  return { last, mark }
}
export function exportAll(): string {
  return JSON.stringify({ tags: read('kh:tags', {}), notes: read('kh:notes', {}), settings: read('kh:settings', {}), last: read('kh:last', null) }, null, 2)
}
export function importAll(json: string) {
  const d = JSON.parse(json)
  if (d.tags) write('kh:tags', d.tags)
  if (d.notes) write('kh:notes', d.notes)
  if (d.settings) write('kh:settings', d.settings)
  if (d.last) write('kh:last', d.last)
}
