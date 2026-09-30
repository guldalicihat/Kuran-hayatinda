// Fırsat Müzayede reklamı: sitenin sahibi tarafından, kendi işletmesi için
// eklenmiştir. İki ayrı görünüm var: dar/mobil ekranda kenara yaslı ince bir
// sekme (gerçek yan boşluk yok, içerik zaten tam genişlikte), geniş
// ekranlarda (xl: 1280px+, içerik en geniş halinde 860px olduğu için yan
// boşluk ancak bu genişlikte rahat sığıyor) tam bir kart. İkisi de aynı
// bağlantıyı açar.
const HREF = 'https://www.firsatmuzayede.com'
const ICON = `${import.meta.env.BASE_URL}ads/firsat-muzayede-icon.png`
const LOGO = `${import.meta.env.BASE_URL}ads/firsat-muzayede-logo.png`

function Tab({ side }: { side: 'left' | 'right' }) {
  const rounded = side === 'left' ? 'rounded-r-xl' : 'rounded-l-xl'
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className={`xl:hidden flex flex-col items-center gap-1 w-9 py-3 shadow-lg tap ${rounded}`}
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

function Card() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden xl:block w-[168px] rounded-2xl overflow-hidden shadow-lg tap"
      style={{ background: '#012055' }}
    >
      <div className="flex flex-col items-center px-4 pt-5 pb-4 text-center">
        <img src={LOGO} width={110} alt="Fırsat Müzayede" className="mb-1" />
        <p className="text-white/70 text-[11px] mt-2 leading-snug">
          Fırsatlarla dolu müzayede dünyasını keşfedin!
        </p>
        <span
          className="mt-3 inline-block text-[12px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: '#33ce34', color: '#012055' }}
        >
          Siteyi Aç ›
        </span>
      </div>
    </a>
  )
}

export function AdRailLeft() {
  return (
    <div className="fixed left-0 xl:left-4 top-1/2 -translate-y-1/2 z-10">
      <Tab side="left" />
      <Card />
    </div>
  )
}

export function AdRailRight() {
  return (
    <div className="fixed right-0 xl:right-4 top-1/2 -translate-y-1/2 z-10">
      <Tab side="right" />
      <Card />
    </div>
  )
}
