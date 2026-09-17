import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters, loadMeals } from '../lib/data'
import type { Chapter } from '../lib/types'
import { useFavorites } from '../lib/store'

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [meals, setMeals] = useState<Record<string, string>>({})
  useEffect(() => { loadChapters().then(setChapters) }, [])
  useEffect(() => {
    const sureler = Array.from(new Set(favorites.map(k => Number(k.split(':')[0]))))
    Promise.all(sureler.map(s => loadMeals(s).then(m => [s, m] as const))).then(pairs => {
      const flat: Record<string, string> = {}
      for (const [s, m] of pairs) for (const [a, meal] of Object.entries(m)) flat[`${s}:${a}`] = meal
      setMeals(flat)
    })
  }, [favorites])
  const items = favorites
    .map(k => { const [s, a] = k.split(':').map(Number); return { key: k, s, a } })
    .sort((x, y) => x.s - y.s || x.a - y.a)
  const name = (s: number) => chapters.find(c => c.n === s)?.ad ?? s
  return (
    <div className="safe-bottom">
      <Header title="Favorilerim" right={<span />} />
      <p className="px-4 py-3 text-sm muted">Favorilerine eklediğin ayetler burada toplanır. Veriler yalnız bu cihazda saklanır.</p>
      {items.length === 0 && <p className="p-6 text-center muted">Henüz favori ayetin yok. Bir ayeti açıp kalp ikonuna dokunarak ekleyebilirsin.</p>}
      <ul className="card">
        {items.map(({ key, s, a }) => (
          <li key={key} className="border-b hairline flex items-center">
            <Link to={`/sure/${s}/${a}`} className="flex-1 px-4 py-3 tap min-w-0">
              <span className="block font-medium">{name(s)} {a}</span>
              {meals[key] && <span className="block muted text-sm truncate">{meals[key]}</span>}
            </Link>
            <button onClick={() => toggle(key)} className="px-4 muted tap" aria-label="Favorilerden kaldır">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
