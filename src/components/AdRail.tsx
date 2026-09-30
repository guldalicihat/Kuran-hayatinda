// Fırsat Müzayede reklamı: sitenin sahibi tarafından, kendi işletmesi için
// eklenmiştir. Tek taraf (sağ): dar/mobil ekranda kenara yaslı ince bir
// sekme (gerçek yan boşluk yok, içerik zaten tam genişlikte), geniş
// ekranlarda (xl: 1280px+) sayfanın tüm yüksekliğini kaplayan geniş bir
// banner. Banner genişliği kadar sağ boşluk App.tsx'te ayrılır ki içerikle
// çakışmasın (tesadüfi geniş ekran boşluğuna güvenmek yerine).
const HREF = 'https://www.firsatmuzayede.com'
const ICON = `${import.meta.env.BASE_URL}ads/firsat-muzayede-icon.png`
const LOGO = `${import.meta.env.BASE_URL}ads/firsat-muzayede-logo.png`
export const AD_BANNER_WIDTH = 240

function Tab() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="xl:hidden flex flex-col items-center gap-1 w-9 py-3 shadow-lg tap rounded-l-xl"
      style={{ background: '#012055' }}
      aria-label="Fırsat Müzayede — siteyi aç"
    >
      <img src={ICON} width={22} height={22} alt="" />
      <span
        className="text-white font-bold text-[10px] tracking-wide"
        style={{ writingMode: 'vertical-rl', color: '#33ce34' }}
      >
        Müzayede
      </span>
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
      <div className="xl:hidden fixed right-0 top-1/2 -translate-y-1/2 z-10">
        <Tab />
      </div>
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 z-10">
        <Banner />
      </div>
    </>
  )
}
