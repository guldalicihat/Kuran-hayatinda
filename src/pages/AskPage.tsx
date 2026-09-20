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
  return (
    <div className="safe-bottom">
      <Header title="Sor" />
      <div className={empty ? 'flex flex-col items-center px-6' : 'px-4 py-2'} style={empty ? { paddingTop: '8vh' } : undefined}>
        {empty && <h1 className="text-[20px] font-semibold mb-1">Ne yaşıyorsun?</h1>}
        {empty && <p className="text-sm muted mb-4 text-center max-w-[360px]">Durumunu kendi cümlenle yaz; Kur'an'daki ilgili ayetleri meal ve günlük hayat açıklamalarıyla bulalım.</p>}
        <label className={`flex items-center gap-3 rounded-full px-4 card border hairline tap ${empty ? 'w-full max-w-[420px]' : ''}`} style={{ paddingTop: empty ? 14 : 10, paddingBottom: empty ? 14 : 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="muted shrink-0"><path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" /></svg>
          <input ref={inputRef} value={q} onChange={e => setQuery(e.target.value)} placeholder="Örn. ortağımla anlaşmazlık yaşıyorum" className="flex-1 bg-transparent outline-none" style={{ fontSize: empty ? 17 : 16 }} />
          {q && <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="muted text-sm tap">Temizle</button>}
        </label>
        {empty && (
          <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-[460px]">
            {ORNEKLER.map(o => <button key={o} onClick={() => setQuery(o)} className="text-sm px-3 py-1.5 rounded-full border hairline card tap">{o}</button>)}
          </div>
        )}
        {empty && <p className="text-xs muted mt-6 text-center max-w-[360px]">Ayetler sitedeki kök temelli mealden alınır; açıklamalar "taslak" ya da "incelendi" durumuyla gösterilir. Bu bir okuma yardımıdır, fetva değildir; hüküm gerektiren konularda bir âlime danışın.</p>}
      </div>
      {!empty && topicHits.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs muted">Konular:</span>
          {topicHits.map(k => <button key={k.id} onClick={() => setQuery(k.ad)} className="text-xs px-2.5 py-1 rounded-full accent tap" style={{ background: 'var(--accent-soft)' }}>{k.ad}</button>)}
        </div>
      )}
      <ul className="card">
        {verses.map(v => {
          const key = `${v.sure}:${v.ayet}`
          const meta = topics.ayetler[key]
          return (
            <li key={key} className="border-b hairline">
              <Link to={`/sure/${v.sure}/${v.ayet}`} className="block px-4 py-3 tap">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="accent text-sm">{name(v.sure)} {v.ayet}</span>
                  {meta && <span className="text-[11px] px-2 py-0.5 rounded-full border hairline muted">{meta.d === 'incelendi' ? 'İncelendi' : 'Taslak'}</span>}
                  {v.konular.slice(0, 2).map(k => <span key={k} className="text-[11px] muted">· {k}</span>)}
                </span>
                <span className="block meal text-[0.98em] mt-1">“{meals.get(key) ?? ''}”</span>
                {meta?.b && <span className="block text-sm mt-1.5 rounded-lg px-2 py-1.5" style={{ background: 'var(--accent-soft)' }}><span className="font-semibold">Bugün: </span>{meta.b}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
      {!empty && t.length >= 3 && !ref && !yukleniyor && verses.length === 0 && <p className="p-6 text-center muted">Bu ifadeyle eşleşen ayet bulunamadı. Daha kısa ve somut yazmayı deneyin: "borç", "sabır", "ortaklık".</p>}
      {!empty && yukleniyor && <p className="p-6 text-center muted">Yükleniyor…</p>}
      {!empty && verses.length > 0 && <p className="px-4 py-4 text-xs muted text-center">Sonuçlar konu sözlüğü ve meal/açıklama eşleşmesiyle sıralanır; yapay zekâ yorumu içermez. Ayete dokununca tam açıklama açılır.</p>}
    </div>
  )
}
