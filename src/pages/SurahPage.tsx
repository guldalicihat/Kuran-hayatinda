import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigationType, useParams } from 'react-router-dom'
import Header from '../components/Header'
import FilterInput from '../components/FilterInput'
import AyetCard from '../components/AyetCard'
import { loadChapters, loadContentIndex, loadMeals, loadSurah, orderChapters } from '../lib/data'
import type { Chapter, ContentIndex, MealMap, Surah } from '../lib/types'
import { useLastRead } from '../lib/store'
import { useSettings } from '../lib/settings'
import { usePageMeta } from '../lib/seo'

const SCROLL_KEY = 'kh:surah-scroll'
function readScrollMap(): Record<string, number> {
  try { return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}') } catch { return {} }
}
function writeScrollY(path: string, y: number) {
  try { const map = readScrollMap(); map[path] = y; sessionStorage.setItem(SCROLL_KEY, JSON.stringify(map)) } catch { /* yoksay */ }
}

function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

export default function SurahPage() {
  const n = Number(useParams().n)
  const loc = useLocation()
  const navType = useNavigationType()
  const pathRef = useRef(loc.pathname); pathRef.current = loc.pathname
  const [surah, setSurah] = useState<Surah | null>(null)
  const [ch, setCh] = useState<Chapter | undefined>()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [meals, setMeals] = useState<MealMap>({})
  const [idx, setIdx] = useState<ContentIndex>({})
  const [q, setQ] = useState('')
  const { last, mark } = useLastRead()
  const { s: settings } = useSettings()
  // Kaydırma konumunu sure yoluna göre sakla (main.tsx scrollRestoration=manual olduğu için elle).
  useEffect(() => {
    const onScroll = () => writeScrollY(pathRef.current, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    setSurah(null)
    loadSurah(n).then(setSurah)
    loadChapters().then(cs => { setChapters(cs); setCh(cs.find(c => c.n === n)) })
    loadMeals(n).then(setMeals)
    loadContentIndex().then(setIdx)
  }, [n])
  useEffect(() => {
    if (!surah) return
    if (navType === 'POP') {
      // Ayet açıklamasından (tarayıcı geri / Geri düğmesi / sağa kaydırma) dönüş: kaldığın yere dön,
      // "son okunan" kaydını bozma. Kayıtlı konum yoksa aynı surede son okunan ayete git.
      const y = readScrollMap()[loc.pathname]
      // İlk açılışta (paylaşılan bağlantı, yeni sekme) son okunan ayete sıçrama; yalnız geçmiş içinde dönüşte.
      const lastA = loc.key !== 'default' && last && last.s === n ? last.a : 0
      requestAnimationFrame(() => {
        if (y) window.scrollTo(0, y)
        else if (lastA > 1) document.getElementById(`a${lastA}`)?.scrollIntoView({ block: 'start' })
      })
      return
    }
    const hash = loc.hash || (loc.state as { a?: number } | null)?.a
    const target = typeof hash === 'string' ? hash.replace('#', '') : hash ? `a${hash}` : ''
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, 0)
    mark(n, target ? Number(target.replace('a', '')) || 1 : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah])
  const items = useMemo(() => {
    if (!surah) return []
    const nq = norm(q)
    return surah.ayetler.filter(a => !nq || String(a.n) === q.trim() || norm(a.okunus).includes(nq) || norm(meals[a.n] ?? '').includes(nq))
  }, [surah, q, meals])
  const has = new Set(idx[String(n)] ?? [])
  const ordered = useMemo(() => orderChapters(chapters, settings.sort), [chapters, settings.sort])
  const orderIdx = ordered.findIndex(c => c.n === n)
  const prevCh = orderIdx > 0 ? ordered[orderIdx - 1] : undefined
  const nextCh = orderIdx >= 0 && orderIdx < ordered.length - 1 ? ordered[orderIdx + 1] : undefined
  usePageMeta(
    ch ? `${ch.ad} Suresi` : '',
    ch ? `${ch.ad} suresi (${ch.ayet} ayet, ${ch.tip === 'mekki' ? 'Mekki' : 'Medeni'}) — kök temelli Türkçe meal ve her ayetin günlük hayatla bağlantısını kuran açıklamalar.` : undefined,
  )
  return (
    <div className="safe-bottom">
      <Header title={ch?.ad ?? '…'} back={loc.key !== 'default' ? '' : '/'} backLabel={loc.key !== 'default' ? 'Geri' : 'Sureler'} />
      <FilterInput value={q} onChange={setQ} />
      {ch && (
        <p className="px-4 pb-2 text-xs muted">{ch.tip === 'mekki' ? 'Mekki' : 'Medeni'} · İniş sırası {ch.nuzul} · {ch.ayet} ayet · <span className="arabic inline text-[1.1em]" style={{ direction: 'rtl' }}>{ch.ar}</span></p>
      )}
      {n !== 1 && n !== 9 && (
        <p className="arabic text-center px-4 pb-2 !text-[1.1em]" style={{ fontSize: 'calc(var(--size-arabic) * 0.95)' }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
      )}
      {!surah && <p className="p-6 text-center muted">Yükleniyor…</p>}
      {items.map(a => (
        <AyetCard key={a.n} sure={n} ayet={a} meal={meals[a.n]} hasContent={has.has(a.n)} />
      ))}
      {surah && items.length === 0 && <p className="p-6 text-center muted">Eşleşen ayet yok.</p>}
      {surah && (prevCh || nextCh) && (
        <div className="flex justify-between px-4 py-4">
          {prevCh ? <Link to={`/sure/${prevCh.n}`} className="accent tap">‹ {prevCh.ad}</Link> : <span />}
          {nextCh ? <Link to={`/sure/${nextCh.n}`} className="accent tap">{nextCh.ad} ›</Link> : <span />}
        </div>
      )}
    </div>
  )
}
