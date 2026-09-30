// Fırsat Müzayede reklamı: sitenin sahibi tarafından, kendi işletmesi için
// eklenmiştir. Üç ayrı görünüm var:
// - Mobil/dar ekran (xl altı): alt menünün (TabBar) hemen üstünde, ince ve
//   sade yatay bir buton şeridi (MobileAdBar). Ortada dikey kart/sekme
//   kullanılmıyor çünkü liste içeriğine biniyordu.
// - Geniş ekran (xl: 1280px+): sayfanın tüm yüksekliğini kaplayan, sağda VE
//   solda simetrik iki banner.
const HREF = 'https://www.firsatmuzayede.com'
const ICON = `${import.meta.env.BASE_URL}ads/firsat-muzayede-icon.png`
const LOGO = `${import.meta.env.BASE_URL}ads/firsat-muzayede-logo.png`
export const AD_BANNER_WIDTH = 240
export const MOBILE_AD_BAR_HEIGHT = 44

export function MobileAdBar() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="xl:hidden fixed left-0 right-0 bottom-0 z-20 flex items-center justify-center gap-2 tap"
      style={{ height: MOBILE_AD_BAR_HEIGHT, background: '#012055', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <img src={ICON} width={18} height={18} alt="" />
      <span className="text-white text-[13px] font-medium">Fırsat Müzayede ile al sat</span>
      <span style={{ color: '#33ce34' }} className="text-[13px] font-semibold">›</span>
    </a>
  )
}

function Banner() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden xl:flex flex-col items-center justify-center gap-6 h-full tap"
      style={{ width: AD_BANNER_WIDTH, background: '#012055' }}
    >
      <img src={LOGO} width={150} alt="Fırsat Müzayede" />
      <p className="text-white text-[16px] font-semibold text-center px-6 leading-snug">
        Fırsat Müzayede ile al sat!
      </p>
      <span
        className="inline-block text-[14px] font-semibold px-4 py-2 rounded-full"
        style={{ background: '#33ce34', color: '#012055' }}
      >
        Siteyi Aç ›
      </span>
    </a>
  )
}

export default function AdRail() {
  return (
    <>
      <MobileAdBar />
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 z-10">
        <Banner />
      </div>
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 z-10">
        <Banner />
      </div>
    </>
  )
}
