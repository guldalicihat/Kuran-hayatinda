import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters, loadContentSearch, loadTopics, parseRef } from '../lib/data'
import { prepareRows, rankVerses, scoreTopics } from '../lib/ask'
import { usePageMeta } from '../lib/seo'
import type { Chapter, ContentSearchRow, TopicsData } from '../lib/types'

const Q_KEY = 'kh:ask-q'
function readQuery(): string { try { return sessionStorage.getItem(Q_KEY) || '' } catch { return '' } }
function writeQuery(q: string) { try { sessionStorage.setItem(Q_KEY, q) } catch { /* yoksay */ } }

const ORNEKLER = ['Ortağımla anlaşmazlık yaşıyorum', 'Borcumu ödeyemiyorum', 'Sürekli endişeliyim', 'Anne babama nasıl davranmalıyım',
  'Kredi çekmeli miyim', 'Sinirimi tutamıyorum', 'Karar veremiyorum', 'Zor bir dönemden geçiyorum']

function ChatIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H6a2 2 0 01-2-2z" /><path d="M8 9h8M8 12h5" />
    </svg>
  )
}

function Rozet({ durum }: { durum: 'taslak' | 'incelendi' }) {
  const ok = durum === 'incelendi'
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={ok ? { background: 'rgba(52,199,89,.14)', color: '#2f9e4f' } : { background: 'var(--accent-soft)', color: 'var(--accent)' }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />{ok ? 'İncelendi' : 'Taslak'}
    </span>
  )
}

export default function AskPage() {
  const nav = useNavigate()
  const [q, setQ] = useState(readQuery)
  const dq = useDeferredValue(q)
  const inputRef = useRef<HTMLInputElement>(null)
  const [topics, setTopics] = useState<TopicsData>({ konular: [], ayetler: {} })
  const [rows, setRows] = useState<ContentSearchRow[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const setQuery = (v: string) => { setQ(v); writeQuery(v) }
  useEffect(() => { loadTopics().then(setTopics); loadContentSearch().then(setRows); loadChapters().then(setChapters) }, [])
  usePageMeta('Sor', "Yaşadığın durumu yaz; ilgili ayetleri kök temelli meal ve günlük hayat açıklamalarıyla bul.")
  const name = (n: number) => chapters.find(c => c.n === n)?.ad ?? String(n)
  const meals = useMemo(() => { const m = new Map<string, string>(); for (const [s, a, meal] of rows) m.set(`${s}:${a}`, meal); return m }, [rows])
  const prepared = useMemo(() => prepareRows(rows), [rows])
  const t = dq.trim()
  const ref = parseRef(t.replace(/\s+/g, ''))
  const topicHits = useMemo(() => (t.length >= 3 && !ref ? scoreTopics(t, topics) : []), [t, topics, ref])
  const verses = useMemo(() => (t.length >= 3 && !ref ? rankVerses(t, topics, prepared, topicHits) : []), [t, topics, prepared, topicHits, ref])
  useEffect(() => { if (ref) nav(`/sure/${ref[0]}/${ref[1]}`) }, [ref, nav])
  const empty = t.length === 0
  const yukleniyor = topics.konular.length === 0 || rows.length === 0

  const kutu = (
    <label className="flex items-center gap-3 rounded-2xl px-4 card border hairline tap w-full"
      style={{ boxShadow: empty ? '0 6px 24px rgba(0,0,0,.08)' : '0 1px 4px rgba(0,0,0,.05)', paddingTop: empty ? 15 : 11, paddingBottom: empty ? 15 : 11 }}>
      <ChatIcon size={empty ? 22 : 18} className="accent shrink-0" />
      <input ref={inputRef} value={q} onChange={e => setQuery(e.target.value)} placeholder="Ne yaşıyorsun? Kendi cümlenle yaz…"
        className="flex-1 bg-transparent outline-none min-w-0" style={{ fontSize: empty ? 17 : 16 }} />
      {q && <button onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Temizle" className="muted tap rounded-full w-6 h-6 flex items-center justify-center" style={{ background: 'var(--bg)' }}>×</button>}
    </label>
  )

  return (
    <div className="safe-bottom">
      <Header title="Sor" />
      {empty ? (
        <div className="px-5 flex flex-col items-center" style={{ paddingTop: '7vh' }}>
          <div className="w-16 h-16 rounded-[22px] flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)' }}>
            <ChatIcon size={30} className="accent" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight mb-1.5">Ne yaşıyorsun?</h1>
          <p className="text-[15px] muted mb-6 text-center max-w-[340px] leading-snug">Durumunu kendi cümlenle yaz; Kur'an'daki ilgili ayetleri meal ve günlük hayat açıklamalarıyla bulalım.</p>
          <div className="w-full max-w-[440px]">{kutu}</div>
          <div className="mt-6 w-full max-w-[460px]">
            <p className="text-[12px] muted uppercase tracking-wide mb-2 px-1">Örnek sorular</p>
            <div className="flex flex-wrap gap-2">
              {ORNEKLER.map(o => (
                <button key={o} onClick={() => setQuery(o)} className="text-[14px] px-3.5 py-2 rounded-full card border hairline tap" style={{ boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>{o}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 w-full max-w-[460px] rounded-2xl card border hairline px-4 py-3.5 text-[13px] leading-relaxed">
            <p className="font-semibold mb-1.5">Nasıl çalışır?</p>
            <ul className="space-y-1 muted">
              <li className="flex gap-2"><span className="accent">•</span><span>Ayetler sitedeki kök temelli mealden alınır; hiçbir metin yapay zekâ tarafından anında üretilmez.</span></li>
              <li className="flex gap-2"><span className="accent">•</span><span>Her ayette <b>Taslak</b> ya da <b>İncelendi</b> rozeti bulunur; taslak açıklamalar henüz insan incelemesinden geçmemiştir.</span></li>
              <li className="flex gap-2"><span className="accent">•</span><span>Bu bir okuma yardımıdır, fetva değildir. Hüküm gerektiren konularda bir âlime danışın.</span></li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-3 pb-1">{kutu}</div>
      )}

      {!empty && topicHits.length > 0 && (
        <div className="px-4 pt-2 pb-3 flex flex-wrap gap-2 items-center">
          {topicHits.map((k, i) => (
            <button key={k.id} onClick={() => setQuery(k.ad)} className="text-[13px] px-3 py-1.5 rounded-full tap font-medium"
              style={i === 0 ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--accent-soft)', color: 'var(--accent)' }}>{k.ad}</button>
          ))}
        </div>
      )}

      {!empty && verses.length > 0 && (
        <div className="px-4 space-y-3">
          {verses.map((v, i) => {
            const key = `${v.sure}:${v.ayet}`
            const meta = topics.ayetler[key]
            return (
              <Link key={key} to={`/sure/${v.sure}/${v.ayet}`} className="block rounded-2xl card border hairline tap overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                <div className="px-4 pt-3.5 pb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{i + 1}</span>
                  <span className="font-semibold text-[15px] truncate">{name(v.sure)} <span className="muted font-normal">{v.ayet}</span></span>
                  <span className="ml-auto shrink-0">{meta && <Rozet durum={meta.d} />}</span>
                </div>
                <div className="my-2 pl-3" style={{ borderLeft: '3px solid var(--accent)', marginLeft: 16, marginRight: 16 }}>
                  <p className="text-[16px] leading-relaxed line-clamp-5">“{meals.get(key) ?? ''}”</p>
                </div>
                {meta?.b && (
                  <div className="mx-4 mt-1 mb-3 rounded-xl px-3 py-2.5 text-[14px] leading-snug flex gap-2" style={{ background: 'var(--accent-soft)' }}>
                    <span className="shrink-0" aria-hidden>☀️</span>
                    <span><span className="font-semibold">Bugün: </span>{meta.b}</span>
                  </div>
                )}
                {v.konular.length > 0 && <p className="px-4 pb-3 text-[12px] muted">{v.konular.slice(0, 2).join(' · ')}</p>}
              </Link>
            )
          })}
          <p className="pt-2 pb-4 text-[12px] muted text-center leading-snug">Sıralama konu sözlüğü ve meal/açıklama eşleşmesiyle yapılır; yapay zekâ yorumu içermez. Ayete dokununca tam açıklama açılır.</p>
        </div>
      )}
      {!empty && t.length >= 3 && !ref && !yukleniyor && verses.length === 0 && (
        <div className="mx-4 mt-2 rounded-2xl card border hairline px-4 py-5 text-center">
          <p className="font-medium mb-1">Bu ifadeyle eşleşen ayet bulunamadı</p>
          <p className="text-sm muted">Daha kısa ve somut yazmayı deneyin: “borç”, “sabır”, “ortaklık”.</p>
        </div>
      )}
      {!empty && yukleniyor && <p className="p-6 text-center muted">Yükleniyor…</p>}
    </div>
  )
}
