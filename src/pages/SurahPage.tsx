import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Header from '../components/Header'
import FilterInput from '../components/FilterInput'
import AyetCard from '../components/AyetCard'
import { loadChapters, loadContentIndex, loadMeals, loadSurah } from '../lib/data'
import type { Chapter, ContentIndex, MealMap, Surah } from '../lib/types'
import { useLastRead, useTags } from '../lib/store'

function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

export default function SurahPage() {
  const n = Number(useParams().n)
  const loc = useLocation()
  const [surah, setSurah] = useState<Surah | null>(null)
  const [ch, setCh] = useState<Chapter | undefined>()
  const [meals, setMeals] = useState<MealMap>({})
  const [idx, setIdx] = useState<ContentIndex>({})
  const [q, setQ] = useState('')
  const { tags } = useTags()
  const { mark } = useLastRead()
  useEffect(() => {
    setSurah(null)
    loadSurah(n).then(setSurah)
    loadChapters().then(cs => setCh(cs.find(c => c.n === n)))
    loadMeals(n).then(setMeals)
    loadContentIndex().then(setIdx)
  }, [n])
  useEffect(() => {
    if (!surah) return
    const hash = loc.hash || (loc.state as { a?: number } | null)?.a
    const target = typeof hash === 'string' ? hash.replace('#', '') : hash ? `a${hash}` : ''
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'start' })
    mark(n, target ? Number(target.replace('a', '')) || 1 : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah])
  const items = useMemo(() => {
    if (!surah) return []
    const nq = norm(q)
    return surah.ayetler.filter(a => !nq || String(a.n) === q.trim() || norm(a.okunus).includes(nq) || norm(meals[a.n] ?? '').includes(nq))
  }, [surah, q, meals])
  const has = new Set(idx[String(n)] ?? [])
  return (
    <div className="safe-bottom">
      <Header title={ch?.ad ?? '…'} back="/" backLabel="Sureler" />
      <FilterInput value={q} onChange={setQ} />
      {ch && (
        <p className="px-4 pb-2 text-xs muted">{ch.tip === 'mekki' ? 'Mekki' : 'Medeni'} · İniş sırası {ch.nuzul} · {ch.ayet} ayet · <span className="arabic inline text-[1.1em]" style={{ direction: 'rtl' }}>{ch.ar}</span></p>
      )}
      {n !== 1 && n !== 9 && (
        <p className="arabic text-center px-4 pb-2 !text-[1.1em]" style={{ fontSize: 'calc(var(--size-arabic) * 0.95)' }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
      )}
      {!surah && <p className="p-6 text-center muted">Yükleniyor…</p>}
      {items.map(a => (
        <AyetCard key={a.n} sure={n} ayet={a} meal={meals[a.n]} hasContent={has.has(a.n)} tags={tags[`${n}:${a.n}`]} />
      ))}
      {surah && items.length === 0 && <p className="p-6 text-center muted">Eşleşen ayet yok.</p>}
    </div>
  )
}
