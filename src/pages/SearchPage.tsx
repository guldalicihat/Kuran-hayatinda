import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import FilterInput from '../components/FilterInput'
import { loadChapters, loadContentSearch, loadSearch, parseRef } from '../lib/data'
import type { Chapter, ContentSearchRow, SearchRow } from '../lib/types'

function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const nText = norm(text), nq = norm(q)
  const i = nText.indexOf(nq)
  if (i < 0) return <>{text}</>
  return <>{text.slice(0, i)}<mark className="bg-transparent font-semibold" style={{ color: 'var(--accent)' }}>{text.slice(i, i + nq.length)}</mark>{text.slice(i + nq.length)}</>
}

// Uzun bir metinde eşleşmenin geçtiği yeri, bağlamıyla birlikte kısaltıp döndürür.
function snippet(text: string, q: string, radius = 60): string {
  const i = norm(text).indexOf(norm(q))
  if (i < 0) return text.slice(0, radius * 2)
  const start = Math.max(0, i - radius), end = Math.min(text.length, i + q.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

interface Result { sure: number; ayet: number; okunus: string; meal?: string; matchField: 'okunus' | 'meal' | 'extra' | 'ref'; extra?: string }

export default function SearchPage() {
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const [rows, setRows] = useState<SearchRow[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [contentRows, setContentRows] = useState<ContentSearchRow[]>([])
  useEffect(() => {
    loadSearch().then(setRows)
    loadChapters().then(setChapters)
    loadContentSearch().then(setContentRows)
  }, [])
  const name = (n: number) => chapters.find(c => c.n === n)?.ad ?? String(n)
  const content = useMemo(() => {
    const m = new Map<string, { meal: string; extra: string }>()
    for (const [s, a, meal, extra] of contentRows) m.set(`${s}:${a}`, { meal, extra })
    return m
  }, [contentRows])
  const results = useMemo<Result[]>(() => {
    const t = dq.trim(); if (t.length < 2) return []
    const ref = parseRef(t.replace(/\s+/g, ''))
    if (ref) {
      const r = rows.find(x => x[0] === ref[0] && x[1] === ref[1])
      if (!r) return []
      const c = content.get(`${ref[0]}:${ref[1]}`)
      return [{ sure: ref[0], ayet: ref[1], okunus: r[2], meal: c?.meal, matchField: 'ref' }]
    }
    const nq = norm(t)
    const out: Result[] = []
    for (const [s, a, okunus] of rows) {
      const c = content.get(`${s}:${a}`)
      if (norm(okunus).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c?.meal, matchField: 'okunus' })
      else if (c && norm(c.meal).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c.meal, matchField: 'meal' })
      else if (c && norm(c.extra).includes(nq)) out.push({ sure: s, ayet: a, okunus, meal: c.meal, matchField: 'extra', extra: c.extra })
      if (out.length >= 200) break
    }
    return out
  }, [dq, rows, content])
  return (
    <div className="safe-bottom">
      <Header title="Ara" />
      <FilterInput value={q} onChange={setQ} placeholder="Okunuş, meal, açıklama veya 8:65" />
      <p className="px-4 pb-2 text-xs muted">Okunuş, meal ve açıklamalarda (günlük hayat, bugün yapabilirsin vb.) arar. Sure:ayet biçiminde (örn. 8:65) doğrudan gider.</p>
      <ul className="card">
        {results.map(r => (
          <li key={`${r.sure}:${r.ayet}`} className="border-b hairline">
            <Link to={`/sure/${r.sure}/${r.ayet}`} className="block px-4 py-3 tap">
              <span className="accent text-sm">{name(r.sure)} {r.ayet}</span>
              <span className="block okunus"><Highlight text={r.okunus} q={r.matchField === 'okunus' ? dq : ''} /></span>
              {r.meal && <span className="block meal text-sm mt-1"><Highlight text={r.meal} q={r.matchField === 'meal' ? dq : ''} /></span>}
              {r.matchField === 'extra' && r.extra && (
                <span className="block text-sm mt-1.5 rounded-lg px-2 py-1.5" style={{ background: 'var(--accent-soft)' }}>
                  <Highlight text={snippet(r.extra, dq)} q={dq} />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {dq.trim().length >= 2 && results.length === 0 && <p className="p-6 text-center muted">Sonuç yok.</p>}
    </div>
  )
}
