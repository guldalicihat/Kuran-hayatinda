import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters } from '../lib/data'
import type { Chapter } from '../lib/types'
import { useNotes } from '../lib/store'

export default function NotesPage() {
  const { notes } = useNotes()
  const [chapters, setChapters] = useState<Chapter[]>([])
  useEffect(() => { loadChapters().then(setChapters) }, [])
  const keys = Object.keys(notes).sort((x, y) => { const [a, b] = x.split(':').map(Number); const [c, d] = y.split(':').map(Number); return a - c || b - d })
  const name = (k: string) => { const [s, a] = k.split(':').map(Number); return `${chapters.find(c => c.n === s)?.ad ?? s} ${a}` }
  return (
    <div className="safe-bottom">
      <Header title="Notlar" right={<span />} />
      <p className="px-4 py-3 text-sm muted">Ayet sayfasında yazdığın notlar. Yalnız bu cihazda saklanır; Ayarlar'dan yedekleyebilirsin.</p>
      <ul className="card">
        {keys.map(k => (
          <li key={k} className="border-b hairline">
            <Link to={`/sure/${k.split(':')[0]}/${k.split(':')[1]}`} className="block px-4 py-3 tap">
              <span className="accent text-sm">{name(k)}</span>
              <span className="block line-clamp-3 whitespace-pre-wrap">{notes[k]}</span>
            </Link>
          </li>
        ))}
      </ul>
      {keys.length === 0 && <p className="p-6 text-center muted">Henüz not yok.</p>}
    </div>
  )
}
