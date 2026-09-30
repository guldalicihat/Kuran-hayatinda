// Fırsat Müzayede reklamı: sitenin sahibi tarafından, kendi işletmesi için
// eklenmiştir. İki ayrı görünüm var:
// - Mobil/dar ekran (xl altı): alt menünün (TabBar) içinde, en üstte ince ve
//   sade yatay bir satır (MobileAdRow). Kendi başına sabit konumlanmıyor;
//   TabBar'ın tek fixed kutusunun doğal akışlı bir çocuğu — böylece
//   güvenli alan dolgusu (safe-area-inset-bottom) yalnızca TabBar'ın dış
//   kutusunda bir kez uygulanıyor ve içerik sıkışmıyor.
// - Geniş ekran (xl: 1280px+): sayfanın tüm yüksekliğini kaplayan, sağda VE
//   solda simetrik iki banner.
const HREF = 'https://www.firsatmuzayede.com'
const ICON = `${import.meta.env.BASE_URL}ads/firsat-muzayede-icon.png`
const LOGO = `${import.meta.env.BASE_URL}ads/firsat-muzayede-logo.png`
export const AD_BANNER_WIDTH = 240

export function MobileAdRow() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="xl:hidden flex items-center justify-center gap-2 py-2 tap"
      style={{ background: '#012055' }}
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
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 z-10">
        <Banner />
      </div>
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 z-10">
        <Banner />
      </div>
    </>
  )
}
