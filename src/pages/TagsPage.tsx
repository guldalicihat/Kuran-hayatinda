import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters } from '../lib/data'
import type { Chapter } from '../lib/types'
import { useTags } from '../lib/store'

export default function TagsPage() {
  const { tags, toggle } = useTags()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [sel, setSel] = useState<string | null>(null)
  useEffect(() => { loadChapters().then(setChapters) }, [])
  const counts: Record<string, number> = {}
  for (const list of Object.values(tags)) for (const t of list) counts[t] = (counts[t] ?? 0) + 1
  const all = Object.keys(counts).sort((a, b) => a.localeCompare(b, 'tr'))
  const name = (k: string) => { const [s, a] = k.split(':').map(Number); return `${chapters.find(c => c.n === s)?.ad ?? s} ${a}` }
  const refs = sel ? Object.entries(tags).filter(([, l]) => l.includes(sel)).map(([k]) => k) : []
  return (
    <div className="safe-bottom">
      <Header title={sel ? `#${sel}` : 'Etiketler'} back={sel ? '' : undefined} backLabel="Etiketler" right={sel ? <button onClick={() => setSel(null)} className="accent tap">Tümü</button> : <span />} />
      {!sel && (
        <>
          <p className="px-4 py-3 text-sm muted">Ayet sayfasında eklediğin etiketler burada toplanır. Veriler yalnız bu cihazda saklanır.</p>
          <ul className="card">
            {all.map(t => (
              <li key={t} className="border-b hairline">
                <button onClick={() => setSel(t)} className="w-full flex justify-between px-4 py-3 tap text-left"><span>#{t}</span><span className="muted">{counts[t]} ›</span></button>
              </li>
            ))}
          </ul>
          {all.length === 0 && <p className="p-6 text-center muted">Henüz etiket yok.</p>}
        </>
      )}
      {sel && (
        <ul className="card">
          {refs.map(k => {
            const [s, a] = k.split(':').map(Number)
            return (
              <li key={k} className="border-b hairline flex items-center">
                <Link to={`/sure/${s}/${a}`} className="flex-1 px-4 py-3 tap">{name(k)}</Link>
                <button onClick={() => toggle(k, sel)} className="px-4 muted tap" aria-label="Etiketi kaldır">✕</button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
