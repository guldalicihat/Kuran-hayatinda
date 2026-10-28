/**
 * "Uygulamayı indir" penceresi (Fırsat Müzayede'deki gibi; "ana ekrana ekle" bandının yerine).
 * - Yalnız telefon / tablette, uygulamanın içinde değilken ve o cihazın mağaza adresi girilmişse (baglantilar.ts).
 * - Biraz gezdikten sonra: ikinci sayfaya geçince ya da sitede 30 sn kalınca, alttan açılır; içerik görünür kalır.
 * - "Sitede devam et" / dışına dokunma → 7 gün, İndir → 30 gün gösterilmez.
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { cihaz, magazaAdresi, uygulamaIcinde } from '../lib/uygulama'

const ANAHTAR = 'kh:uygulama-istem'
const GEZINTI = 'kh:uygulama-sayfa'
const GUN = 86_400_000
const susturuldu = () => { try { return Number(localStorage.getItem(ANAHTAR) ?? 0) > Date.now() } catch { return false } }
const sustur = (gun: number) => { try { localStorage.setItem(ANAHTAR, String(Date.now() + gun * GUN)) } catch { /* depolama kapalı */ } }
const sayfaSay = (yol: string): number => {
  try {
    const l: string[] = JSON.parse(sessionStorage.getItem(GEZINTI) ?? '[]')
    if (!l.includes(yol)) { l.push(yol); sessionStorage.setItem(GEZINTI, JSON.stringify(l.slice(-10))) }
    return l.length
  } catch { return 1 }
}

export default function UygulamaIndir() {
  const { pathname } = useLocation()
  const [gezdi, setGezdi] = useState(false)
  const [acik, setAcik] = useState(false)
  const c = cihaz()
  const adres = magazaAdresi(c)
  const uygun = !!adres && c !== 'masaustu' && !uygulamaIcinde() && !susturuldu() && gezdi

  useEffect(() => { if (sayfaSay(pathname) >= 2) setGezdi(true) }, [pathname])
  useEffect(() => { const z = window.setTimeout(() => setGezdi(true), 30_000); return () => window.clearTimeout(z) }, [])
  useEffect(() => { if (uygun && !acik) setAcik(true) }, [uygun, acik])
  useEffect(() => {
    if (!acik) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { sustur(7); setAcik(false) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [acik])

  if (!acik) return null
  const kapat = () => { sustur(7); setAcik(false) }
  const android = c === 'android'
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" data-uygulama-istemi>
      <div className="absolute inset-0 bg-black/40" onClick={kapat} aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="ui-baslik"
        className="card relative w-full max-w-[560px] rounded-t-2xl px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl">
        <span className="block mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={60} height={60} className="rounded-[14px]" />
          <div className="min-w-0">
            <h2 id="ui-baslik" className="font-semibold text-[18px]">Kur'an Hayatında uygulaması</h2>
            <p className="muted text-[14px]">Ücretsiz · iPhone, iPad ve Android</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-[15px]">
          {(android
            ? ['Ana ekrandan tek dokunuşla açılır', 'Açtığınız sureler internet olmadan da açılır', 'Tam ekran, sade okuma']
            : ['Her sabah günün ayeti bildirim olarak gelsin', 'Açtığınız sureler internet olmadan da açılır', 'Tek dokunuşla tam ekran okuma']).map(x => (
            <li key={x} className="flex gap-2"><span className="accent font-bold">✓</span><span>{x}</span></li>
          ))}
        </ul>
        <a href={adres} target="_blank" rel="noopener noreferrer" data-uygulama-indir
          onClick={() => { sustur(30); setAcik(false) }}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent text-white py-3.5 text-[16px] font-semibold tap">
          {android ? "Google Play'den indir" : "App Store'dan indir"}
        </a>
        <button type="button" onClick={kapat} className="mt-2 w-full py-3 muted text-[15px] tap" data-uygulama-sonra>Sitede devam et</button>
      </section>
    </div>
  )
}
