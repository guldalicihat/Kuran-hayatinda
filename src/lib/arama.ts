/** Metin araması (eski Ara sayfası): okunuş, meal ve açıklamalarda alt dize eşleşmesi. */
import type { SearchRow } from './types'

export function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

// Uzun bir metinde eşleşmenin geçtiği yeri, bağlamıyla birlikte kısaltıp döndürür.
export function snippet(text: string, q: string, radius = 60): string {
  const i = norm(text).indexOf(norm(q))
  if (i < 0) return text.slice(0, radius * 2)
  const start = Math.max(0, i - radius), end = Math.min(text.length, i + q.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export interface MetinSonucu { sure: number; ayet: number; okunus: string; meal?: string; matchField: 'okunus' | 'meal' | 'extra'; extra?: string }

export function metinAra(q: string, rows: SearchRow[], content: Map<string, { meal: string; extra: string }>, limit = 200): MetinSonucu[] {
  const t = q.trim()
  if (t.length < 2) return []
  const nq = norm(t)
  const out: MetinSonucu[] = []
  for (const [s, a, okunus] of rows) {
    const c = content.get(`${s}:${a}`)
    if (norm(okunus).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c?.meal, matchField: 'okunus' })
    else if (c && norm(c.meal).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c.meal, matchField: 'meal' })
    else if (c && norm(c.extra).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c.meal, matchField: 'extra', extra: c.extra })
    if (out.length >= limit) break
  }
  return out
}
