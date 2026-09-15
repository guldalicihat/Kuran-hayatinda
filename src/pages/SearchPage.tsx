import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import FilterInput from '../components/FilterInput'
import { loadChapters, loadContentIndex, loadMeals, loadSearch, parseRef } from '../lib/data'
import type { Chapter, SearchRow } from '../lib/types'

function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<SearchRow[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [meals, setMeals] = useState<Record<string, string>>({})
  useEffect(() => {
    loadSearch().then(setRows); loadChapters().then(setChapters)
    loadContentIndex().then(async idx => {
      const m: Record<string, string> = {}
      for (const s of Object.keys(idx)) { const mm = await loadMeals(Number(s)); for (const a of Object.keys(mm)) m[`${s}:${a}`] = mm[a] }
      setMeals(m)
    })
  }, [])
  const name = (n: number) => chapters.find(c => c.n === n)?.ad ?? String(n)
  const results = useMemo(() => {
    const t = q.trim(); if (t.length < 2) return []
    const ref = parseRef(t.replace(/\s+/g, ''))
    if (ref) return rows.filter(r => r[0] === ref[0] && r[1] === ref[1])
    const nq = norm(t)
    return rows.filter(r => norm(r[2]).includes(nq) || norm(meals[`${r[0]}:${r[1]}`] ?? '').includes(nq)).slice(0, 200)
  }, [q, rows, meals])
  return (
    <div className="safe-bottom">
      <Header title="Ara" />
      <FilterInput value={q} onChange={setQ} placeholder="Okunuş, meal veya 8:65" />
      <p className="px-4 pb-2 text-xs muted">Okunuşta ve hazır meallerde arar. Sure:ayet biçiminde (örn. 8:65) doğrudan gider.</p>
      <ul className="card">
        {results.map(r => (
          <li key={`${r[0]}:${r[1]}`} className="border-b hairline">
            <Link to={`/sure/${r[0]}/${r[1]}`} className="block px-4 py-3 tap">
              <span className="accent text-sm">{name(r[0])} {r[1]}</span>
              <span className="block okunus">{r[2]}</span>
              {meals[`${r[0]}:${r[1]}`] && <span className="block meal text-sm mt-1">{meals[`${r[0]}:${r[1]}`]}</span>}
            </Link>
          </li>
        ))}
      </ul>
      {q.trim().length >= 2 && results.length === 0 && <p className="p-6 text-center muted">Sonuç yok.</p>}
    </div>
  )
}
