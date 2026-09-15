import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { loadChapters, loadContent, loadContentIndex, loadSurah, parseRef } from '../lib/data'
import type { Ayah, Chapter, Content } from '../lib/types'
import { useLastRead, useNotes, useTags } from '../lib/store'

function Section({ no, title, children }: { no?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card border-b hairline px-4 py-4">
      <h2 className="font-semibold text-[17px] mb-2">{no && <span className="accent mr-1.5">{no}</span>}{title}</h2>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </section>
  )
}

export default function AyahPage() {
  const p = useParams(); const n = Number(p.n); const a = Number(p.a)
  const [ch, setCh] = useState<Chapter | undefined>()
  const [ayah, setAyah] = useState<Ayah | undefined>()
  const [content, setContent] = useState<Content | null | undefined>(undefined)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const { tags, toggle } = useTags(); const { notes, save } = useNotes(); const { mark } = useLastRead()
  const key = `${n}:${a}`
  const [note, setNote] = useState(notes[key] ?? '')
  const [newTag, setNewTag] = useState('')
  useEffect(() => {
    setContent(undefined); setAyah(undefined)
    loadChapters().then(cs => { setChapters(cs); setCh(cs.find(c => c.n === n)) })
    loadSurah(n).then(s => setAyah(s.ayetler.find(x => x.n === a)))
    loadContentIndex().then(idx => {
      if ((idx[String(n)] ?? []).includes(a)) loadContent(n, a).then(setContent).catch(() => setContent(null))
      else setContent(null)
    })
    mark(n, a); setNote(notes[key] ?? ''); window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, a])
  const allTags = Array.from(new Set(Object.values(tags).flat())).sort((x, y) => x.localeCompare(y, 'tr'))
  const mine = tags[key] ?? []
  const prev = a > 1 ? `/sure/${n}/${a - 1}` : n > 1 ? `/sure/${n - 1}/${chapters.find(c => c.n === n - 1)?.ayet ?? 1}` : null
  const next = ch && a < ch.ayet ? `/sure/${n}/${a + 1}` : n < 114 ? `/sure/${n + 1}/1` : null
  const refName = (ref: string) => { const r = parseRef(ref); const c = r && chapters.find(x => x.n === r[0]); return c ? `${c.ad} ${r![1]}` : ref }
  return (
    <div className="safe-bottom">
      <Header title={ch ? `${ch.ad} ${a}` : '…'} back={`/sure/${n}`} backLabel={ch?.ad ?? 'Sure'} />
      {ayah && (
        <section className="card border-b hairline px-4 py-4">
          <p className="arabic">{ayah.ar}</p>
          <div className="divider" />
          <p className="okunus">{ayah.okunus}</p>
        </section>
      )}
      {content === undefined && <p className="p-6 text-center muted">Yükleniyor…</p>}
      {content && (
        <>
          <div className="px-4 py-2 text-xs muted flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full ${content.durum === 'incelendi' ? 'accent' : ''}`} style={{ background: 'var(--accent-soft)' }}>
              {content.durum === 'incelendi' ? 'İncelendi' : 'Yapay zekâ destekli taslak · inceleme bekliyor'}
            </span>
          </div>
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
              return (
                <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg)' }}>
                  <p className="font-medium">{pr ? <Link to={`/sure/${pr[0]}/${pr[1]}`} className="accent">{refName(r.ref)}</Link> : r.ref} — Meal:</p>
                  <p className="mt-1">“{r.meal}”</p>
                  <p className="mt-1 muted"><span className="font-medium">Bağlantısı:</span> {r.baglanti}</p>
                </div>
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
      <Section title="Etiketler">
        <div className="flex flex-wrap gap-2">
          {allTags.map(t => (
            <button key={t} onClick={() => toggle(key, t)} className={`px-3 py-1 rounded-full text-sm border hairline tap ${mine.includes(t) ? 'bg-accent text-white border-transparent' : ''}`}>#{t}</button>
          ))}
        </div>
        <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); const t = newTag.trim().replace(/^#/, ''); if (t) { toggle(key, t); setNewTag('') } }}>
          <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Yeni etiket" className="flex-1 rounded-xl px-3 py-2 border hairline bg-transparent outline-none" />
          <button className="px-4 py-2 rounded-xl bg-accent text-white tap">Ekle</button>
        </form>
      </Section>
      <Section title="Notum">
        <textarea value={note} onChange={e => setNote(e.target.value)} onBlur={() => save(key, note)} rows={4} placeholder="Bu ayetle ilgili notun…"
          className="w-full rounded-xl px-3 py-2 border hairline bg-transparent outline-none" />
        <div className="flex justify-end"><button onClick={() => save(key, note)} className="px-4 py-1.5 rounded-xl bg-accent text-white text-sm tap">Kaydet</button></div>
      </Section>
      <div className="flex justify-between px-4 py-4">
        {prev ? <Link to={prev} className="accent tap">‹ Önceki ayet</Link> : <span />}
        {next ? <Link to={next} className="accent tap">Sonraki ayet ›</Link> : <span />}
      </div>
    </div>
  )
}
