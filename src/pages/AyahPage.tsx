import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigationType, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters, loadContent, loadContentIndex, loadSurah, orderChapters, parseRef } from '../lib/data'
import type { Ayah, Chapter, Content } from '../lib/types'
import { useFavorites, useLastRead } from '../lib/store'
import { useSettings } from '../lib/settings'

const SITE = 'https://kuranhayatimda.com'

const SCROLL_KEY = 'kh:ayah-scroll'
function readScrollMap(): Record<string, number> {
  try { return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}') } catch { return {} }
}
function writeScrollY(path: string, y: number) {
  try {
    const map = readScrollMap()
    map[path] = y
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(map))
  } catch { /* yoksay */ }
}

function Section({ no, title, children }: { no?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card border-b hairline px-4 py-4">
      <h2 className="font-semibold text-[17px] mb-2">{no && <span className="accent mr-1.5">{no}</span>}{title}</h2>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </section>
  )
}

function FavShareRow({ fav, onToggle, onShare, copied }: { fav: boolean; onToggle: () => void; onShare: () => void; copied: boolean }) {
  return (
    <div className="card border-b hairline px-4 py-2 flex items-center gap-2">
      <button onClick={onToggle} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border hairline tap ${fav ? 'bg-accent text-white border-transparent' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.7.6 5 2.2C11.8 4.6 13.5 3.7 15.5 4c3.5.5 5 4 3.5 7.2-2.5 4.7-10 9.3-10 9.3z" strokeLinejoin="round" />
        </svg>
        {fav ? 'Favorilerde' : 'Favorilere ekle'}
      </button>
      <button onClick={onShare} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border hairline tap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
        </svg>
        {copied ? 'Bağlantı kopyalandı' : 'Paylaş'}
      </button>
    </div>
  )
}

export default function AyahPage() {
  const p = useParams(); const n = Number(p.n); const a = Number(p.a)
  const location = useLocation()
  const navType = useNavigationType()
  const restoredRef = useRef(false)
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname
  const [ch, setCh] = useState<Chapter | undefined>()
  const [ayah, setAyah] = useState<Ayah | undefined>()
  const [content, setContent] = useState<Content | null | undefined>(undefined)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const { isFavorite, toggle } = useFavorites(); const { mark } = useLastRead()
  const { s: settings } = useSettings()
  const key = `${n}:${a}`
  const fav = isFavorite(key)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const onScroll = () => writeScrollY(pathRef.current, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    restoredRef.current = false
    setContent(undefined); setAyah(undefined)
    loadChapters().then(cs => { setChapters(cs); setCh(cs.find(c => c.n === n)) })
    loadSurah(n).then(s => setAyah(s.ayetler.find(x => x.n === a)))
    loadContentIndex().then(idx => {
      if ((idx[String(n)] ?? []).includes(a)) loadContent(n, a).then(setContent).catch(() => setContent(null))
      else setContent(null)
    })
    mark(n, a)
    if (navType !== 'POP') window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, a])
  useEffect(() => {
    if (navType === 'POP' && !restoredRef.current && ayah && content !== undefined) {
      restoredRef.current = true
      const y = readScrollMap()[location.pathname]
      if (y) requestAnimationFrame(() => window.scrollTo(0, y))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayah, content])
  const ordered = useMemo(() => orderChapters(chapters, settings.sort), [chapters, settings.sort])
  const orderIdx = ordered.findIndex(c => c.n === n)
  const prevCh = orderIdx > 0 ? ordered[orderIdx - 1] : undefined
  const nextCh = orderIdx >= 0 && orderIdx < ordered.length - 1 ? ordered[orderIdx + 1] : undefined
  const prev = a > 1 ? `/sure/${n}/${a - 1}` : prevCh ? `/sure/${prevCh.n}/${prevCh.ayet}` : null
  const next = ch && a < ch.ayet ? `/sure/${n}/${a + 1}` : nextCh ? `/sure/${nextCh.n}/1` : null
  const refName = (ref: string) => { const r = parseRef(ref); const c = r && chapters.find(x => x.n === r[0]); return c ? `${c.ad} ${r![1]}` : ref }
  const share = async () => {
    const url = `${SITE}/#/sure/${n}/${a}`
    const ref = `${ch?.ad ?? ''} ${a}`
    const title = ch ? `${ref} — Kur'an Hayatında` : "Kur'an Hayatında"
    const text = ayah && content?.meal
      ? `${ayah.ar}\n${ayah.okunus}\n\n"${content.meal}"\n(${ref})\n\nKur'an Hayatında —`
      : ayah
        ? `${ayah.ar}\n${ayah.okunus}\n\n(${ref}) — Kur'an Hayatında`
        : title
    if (navigator.share) {
      try { await navigator.share({ title, text, url }) } catch { /* kullanıcı paylaşımı iptal etti */ }
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* pano erişimi yok */ }
    }
  }
  return (
    <div className="safe-bottom">
      <Header title={ch ? `${ch.ad} ${a}` : '…'} back={`/sure/${n}`} backLabel={ch?.ad ?? 'Sure'} />
      {ayah && (
        <>
          <section className="card border-b hairline px-4 py-4">
            <p className="arabic">{ayah.ar}</p>
            <div className="divider" />
            <p className="okunus">{ayah.okunus}</p>
          </section>
          <FavShareRow fav={fav} onToggle={() => toggle(key)} onShare={share} copied={copied} />
        </>
      )}
      {content === undefined && <p className="p-6 text-center muted">Yükleniyor…</p>}
      {content && (
        <>
          <Section no="1." title={`Ayetin meali — ${ch?.ad ?? ''} ${a}`}>
            <p className="text-[1.05em]">“{content.meal}”</p>
            {content.mealNotu && <p className="muted text-[0.95em]">{content.mealNotu}</p>}
          </Section>
          <Section title="Kelime kökleri">
            <table className="w-full text-[0.95em]">
              <tbody>
                {content.kokler.map((k, i) => (
                  <tr key={i} className="border-b hairline align-top">
                    <td className="py-1.5 pr-2 arabic !text-[1.15em] whitespace-nowrap" style={{ fontSize: 'calc(var(--size-arabic) * 0.8)' }}>{k.kelime}</td>
                    <td className="py-1.5 pr-2">
                      <span className="block">{k.karsilik}</span>
                      <span className="block muted text-[0.85em]">{k.okunus && <>{k.okunus} · </>}kök <span className="arabic inline" style={{ fontSize: '1.1em' }}>{k.kok}</span>: {k.kokAnlam}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section no="2." title="Ayet ne anlatıyor?">{content.neAnlatiyor.map((t, i) => <p key={i}>{t}</p>)}</Section>
          <Section no="3." title="Kur'an'ı Kur'an'a sor">
            {content.kuraniKurana.map((r, i) => {
              const pr = parseRef(r.ref)
              const body = (
                <>
                  <p className="font-medium flex items-center justify-between gap-2">
                    <span className={pr ? 'accent' : undefined}>{refName(r.ref)} — Meal:</span>
                    {pr && <span className="accent shrink-0">›</span>}
                  </p>
                  <p className="mt-1">“{r.meal}”</p>
                  <p className="mt-1 muted"><span className="font-medium">Bağlantısı:</span> {r.baglanti}</p>
                </>
              )
              return pr ? (
                <Link key={i} to={`/sure/${pr[0]}/${pr[1]}`} className="block rounded-xl p-3 tap" style={{ background: 'var(--bg)' }}>{body}</Link>
              ) : (
                <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg)' }}>{body}</div>
              )
            })}
          </Section>
          <Section no="4." title="Günlük hayatla bağlantısı">{content.gunlukHayat.map((t, i) => <p key={i}>{t}</p>)}</Section>
          <Section no="5." title="Bugün ne yapabilirsin?">
            <p className="muted text-[0.95em]">Aşağıdakiler ayetten hareketle günlük hayat için önerilerdir.</p>
            <ul className="list-disc pl-5 space-y-1.5">{content.bugun.map((b, i) => <li key={i}><span className="font-medium">{b.baslik}:</span> {b.aciklama}</li>)}</ul>
            <p className="mt-3 rounded-xl p-3" style={{ background: 'var(--accent-soft)' }}><span className="font-semibold">Bugünün adımı:</span> {content.bugununAdimi}</p>
          </Section>
          {content.kaynaklar && content.kaynaklar.length > 0 && (
            <Section title="Kaynaklar">
              <ul className="space-y-1 text-[0.95em]">{content.kaynaklar.map((k, i) => <li key={i}><a href={k.url} target="_blank" rel="noreferrer" className="accent underline">{k.ad}</a></li>)}</ul>
            </Section>
          )}
        </>
      )}
      {content === null && ayah && (
        <>
          <section className="card border-b hairline px-4 py-4">
            <p className="muted">Bu ayetin kök temelli meali ve açıklaması henüz hazırlanmadı. Aşağıda Quranic Arabic Corpus verisinden gelen kelime kökleri görüntüleniyor.</p>
          </section>
          <Section title="Kelime kökleri (ham veri)">
            <table className="w-full text-[0.95em]">
              <tbody>
                {ayah.kelimeler.map((k, i) => (
                  <tr key={i} className="border-b hairline align-top">
                    <td className="py-1.5 pr-3 arabic whitespace-nowrap" style={{ fontSize: 'calc(var(--size-arabic) * 0.8)' }}>{k.ar}</td>
                    <td className="py-1.5">
                      <span className="block">{k.okunus}</span>
                      <span className="block muted text-[0.85em]">{k.kok ? <>kök <span className="arabic inline" style={{ fontSize: '1.1em' }}>{k.kok}</span> · </> : null}{k.tur}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </>
      )}
      {ayah && <FavShareRow fav={fav} onToggle={() => toggle(key)} onShare={share} copied={copied} />}
      <div className="flex justify-between px-4 py-4">
        {prev ? <Link to={prev} className="accent tap">‹ Önceki ayet</Link> : <span />}
        {next ? <Link to={next} className="accent tap">Sonraki ayet ›</Link> : <span />}
      </div>
    </div>
  )
}
