import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

// Sayfa geçişi bitmeden art arda hızlı "Geri" dokunuşlarını (sabırsız çift/
// üçlü dokunma) yutar: ikinci dokunuş yeni sayfanın kendi Header'ına düşse
// bile (ayrı bir bileşen örneği olduğu için) bu modül seviyesindeki zaman
// damgası paylaşıldığından geçmişte fazladan adım atlanmaz.
// Sayfa mount'unu bekleyen bir kilit denendi ama render bazen beklenenden
// çok daha hızlı tamamlandığından gerçek çift dokunmayı yakalayamadı (stres
// testinde daha kötü sonuç verdi); insan tepki süresine dayanan sabit bir
// süre daha güvenilir çıktı. 500ms: ölçülen gerçek çift/üçlü dokunmalar
// kümülatif olarak ~300ms'yi aşmıyor, buna karşın art arda ama bilinçli
// iki geri basışı (yeni sayfayı görüp tekrar karar verme) genelde bundan
// belirgin şekilde uzun sürüyor.
let lastBackAt = 0
const BACK_COOLDOWN_MS = 500

// Header'daki "Geri" düğmesiyle aynı mantığı, sayfanın başka bir yerinde
// (ör. uzun bir sayfanın altında, ikinci bir Geri düğmesi için) yeniden
// kullanmak isteyen bileşenler için dışa açılır. lastBackAt modül
// seviyesinde olduğundan iki düğme de aynı çift-dokunma korumasını paylaşır.
export function useHandleBack(back?: string, backState?: unknown) {
  const nav = useNavigate()
  return () => {
    const now = Date.now()
    if (now - lastBackAt < BACK_COOLDOWN_MS) return
    lastBackAt = now
    // back bir yol ise (gerçek geçmiş yoksa ya da bir üst seviyeye zorlanıyorsa)
    // replace ile gidilir: aksi halde bu sayfa geçmişte kalır ve bir sonraki
    // Geri'de araya sıkışıp kullanıcıyı buraya geri sıçratır. backState, hedef
    // sayfaya (ör. hangi ayete kaydırılacağını) taşımak için kullanılır.
    if (back) nav(back, { replace: true, state: backState }); else nav(-1)
  }
}

export function BackButton({ back, backState, label, className }: { back?: string; backState?: unknown; label?: string; className?: string }) {
  const handleBack = useHandleBack(back, backState)
  return (
    <button onClick={handleBack} className={className ?? 'w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border hairline tap accent'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      <span>{label ?? 'Geri'}</span>
    </button>
  )
}

export default function Header({ title, back, backState, backLabel, right }: { title: ReactNode; back?: string; backState?: unknown; backLabel?: string; right?: ReactNode }) {
  const handleBack = useHandleBack(back, backState)
  return (
    <header className="sticky top-0 z-20 bg-bar border-b hairline safe-top">
      <div className="h-12 grid grid-cols-[1fr_auto_1fr] items-center px-2">
        <div className="justify-self-start min-w-0">
          {back !== undefined && (
            <button onClick={handleBack} className="accent flex items-center gap-0.5 text-[17px] tap max-w-full">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              <span className="truncate">{backLabel ?? 'Geri'}</span>
            </button>
          )}
        </div>
        <h1 className="text-[17px] font-semibold text-center truncate max-w-[60vw]">{title}</h1>
        <div className="justify-self-end">{right ?? <Link to="/ayarlar" className="accent text-[17px] tap px-1" aria-label="Yazı ayarları">Aa</Link>}</div>
      </div>
    </header>
  )
}
