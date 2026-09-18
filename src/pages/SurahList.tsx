import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import FilterInput from '../components/FilterInput'
import { loadChapters } from '../lib/data'
import type { Chapter } from '../lib/types'
import { useSettings } from '../lib/settings'
import { useLastRead } from '../lib/store'

function norm(s: string) { return s.toLocaleLowerCase('tr').replace(/[âîû']/g, c => ({ 'â': 'a', 'î': 'i', 'û': 'u', "'": '' }[c] ?? c)) }

const SCROLL_KEY = 'kh:sure-list-scroll'
function readScrollY(): number {
  try { return Number(localStorage.getItem(SCROLL_KEY)) || 0 } catch { return 0 }
}
function writeScrollY(y: number) {
  try { localStorage.setItem(SCROLL_KEY, String(y)) } catch { /* yoksay */ }
}

export default function SurahList() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [q, setQ] = useState('')
  const { s } = useSettings()
  const { last } = useLastRead()
  const restored = useRef(false)
  useEffect(() => { loadChapters().then(setChapters) }, [])
  useEffect(() => {
    const onScroll = () => { writeScrollY(window.scrollY) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!restored.current && chapters.length > 0) {
      restored.current = true
      window.scrollTo(0, readScrollY())
    }
  }, [chapters])
  const list = useMemo(() => {
    const f = chapters.filter(c => !q || norm(c.ad).includes(norm(q)) || norm(c.anlam).includes(norm(q)) || String(c.n) === q.trim())
    return s.sort === 'nuzul' ? [...f].sort((a, b) => a.nuzul - b.nuzul) : f
  }, [chapters, q, s.sort])
  const sections = s.sort === 'nuzul'
    ? [{ ad: 'Mekki', items: list.filter(c => c.tip === 'mekki') }, { ad: 'Medeni', items: list.filter(c => c.tip === 'medeni') }]
    : [{ ad: '', items: list }]
  const lastCh = last ? chapters.find(c => c.n === last.s) : undefined
  return (
    <div className="safe-bottom">
      <Header title="Sureler" right={<Link to="/ayarlar" className="accent text-[17px] tap px-1">Aa</Link>} />
      <FilterInput value={q} onChange={setQ} placeholder="Sure ara" />
      {lastCh && !q && (
        <Link to={`/sure/${last!.s}/${last!.a}`} className="mx-4 mb-2 flex items-center justify-between rounded-xl px-4 py-3 tap" style={{ background: 'var(--accent-soft)' }}>
          <span><span className="muted text-xs block">Kaldığın yer</span><span className="font-medium">{lastCh.ad} {last!.a}</span></span>
          <span className="accent">›</span>
        </Link>
      )}
      {sections.map(sec => (
        <section key={sec.ad}>
          {sec.ad && <h2 className="sticky top-12 z-10 bg-bar px-4 py-1 text-[15px] font-medium border-y hairline">{sec.ad}</h2>}
          <ul className="card">
            {sec.items.map(c => (
              <li key={c.n}>
                <Link to={`/sure/${c.n}`} className="flex items-center gap-3 pl-4 pr-3 tap">
                  <span className="w-[72px] shrink-0 text-right text-[18px] tabular-nums py-3">
                    {s.sort === 'nuzul' ? <>{c.nuzul} <span className="muted text-[15px]">({c.n})</span></> : c.n}
                  </span>
                  <span className="flex-1 min-w-0 border-b hairline py-2.5 flex items-center">
                    <span className="flex-1 min-w-0">
                      <span className="block text-[18px] truncate">{c.ad}</span>
                      <span className="block muted text-[14px] truncate">{c.anlam}</span>
                    </span>
                    <span className="muted text-[15px] tabular-nums">({c.ayet})</span>
                    <span className="muted ml-2">›</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {chapters.length === 0 && <p className="p-6 text-center muted">Yükleniyor…</p>}
    </div>
  )
}
