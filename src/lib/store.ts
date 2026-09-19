// Cihazda saklanan kullanıcı verisi: favoriler, son okunan yer.
import { useCallback, useEffect, useState } from 'react'

export type FavoriteSet = string[]          // ["8:65", "2:255", ...]
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
const EMPTY_FAVORITES: FavoriteSet = []

export function useFavorites() {
  const [favorites, setFavorites] = useStored<FavoriteSet>('kh:favorites', EMPTY_FAVORITES)
  const toggle = (key: string) => {
    const next = favorites.includes(key) ? favorites.filter(k => k !== key) : [...favorites, key]
    setFavorites(next)
  }
  const isFavorite = (key: string) => favorites.includes(key)
  return { favorites, toggle, isFavorite }
}
export function useLastRead() {
  const [last, setLast] = useStored<LastRead | null>('kh:last', null)
  const mark = (s: number, a: number) => setLast({ s, a, t: Date.now() })
  return { last, mark }
}
