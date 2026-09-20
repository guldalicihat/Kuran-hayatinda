import Header from '../components/Header'
import { BAGLANTILAR } from '../lib/baglantilar'
import { usePageMeta } from '../lib/seo'

const BOT_YARDIM = `${BAGLANTILAR.telegramBot}?start=yardim`
const BOT_GONULLU = `${BAGLANTILAR.telegramBot}?start=gonullu`

function Dis({ href, className, style, children, testid }: { href: string; className?: string; style?: React.CSSProperties; children: React.ReactNode; testid?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} data-testid={testid}>{children}</a>
}

export default function CommunityPage() {
  usePageMeta('Topluluk', "Kur'an Hayatında Telegram topluluğu: her sabah bir ayet, İyilik Köprüsü ile yardımlaşma, hafta sonu namaz buluşmaları.")
  return (
    <div className="safe-bottom">
      <Header title="Topluluk" />
      <div className="px-4 pt-5 flex flex-col items-center text-center">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} width={72} height={72} className="rounded-[22px] mb-3" alt="" />
        <h1 className="text-[24px] font-semibold tracking-tight mb-1.5">Kur'an Hayatında topluluğu</h1>
        <p className="text-[15px] muted max-w-[360px] leading-snug mb-5">Telegram kanalımızda her sabah bir ayet, yardımlaşma ve hafta sonu buluşmaları. Kayıt yok, herkese açık.</p>
        <Dis href={BAGLANTILAR.telegramKanal} testid="kanala-katil"
          className="flex items-center justify-center gap-2 w-full max-w-[460px] rounded-2xl py-4 text-[17px] font-semibold tap"
          style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 6px 18px rgba(154,91,11,.28)' }}>
          ✈️ Topluluğumuza katıl
        </Dis>
        <p className="text-[12px] muted mt-2">t.me/kuranhayatimda</p>
      </div>

      <div className="px-4 mt-6 space-y-3 max-w-[460px] mx-auto">
        <section className="rounded-2xl card border hairline px-4 py-3.5">
          <h2 className="font-semibold text-[16px] mb-1">🌅 Her sabah bir ayet, bir adım</h2>
          <p className="text-[14px] muted leading-snug">Kök temelli meal ve günlük hayata dokunan kısa bir adım; kanalda her sabah.</p>
        </section>

        <section className="rounded-2xl card border hairline px-4 py-3.5" data-testid="iyilik-koprusu">
          <h2 className="font-semibold text-[16px] mb-1">🤝 İyilik Köprüsü</h2>
          <p className="text-[14px] muted leading-snug mb-3">Yardım isteyenle yardım edebileni buluşturuyoruz. Para toplanmaz, para talebi alınmaz; kimlik istenmez, herkes rumuzla anılır. Her talep bir hakem tarafından incelenir; onaylı talepler kanalda kimliksiz yayınlanır.</p>
          <div className="grid grid-cols-2 gap-2">
            <Dis href={BOT_YARDIM} className="rounded-xl py-2.5 text-center text-[14px] font-medium tap" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>🙏 Yardım iste</Dis>
            <Dis href={BOT_GONULLU} className="rounded-xl py-2.5 text-center text-[14px] font-medium tap" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>🤝 Gönüllü ol</Dis>
          </div>
        </section>

        <section className="rounded-2xl card border hairline px-4 py-3.5">
          <h2 className="font-semibold text-[16px] mb-1">🕌 Namazda buluşuyoruz</h2>
          <p className="text-[14px] muted leading-snug">Hafta sonları sabah namazında bir camide buluşuyoruz; namaz sonrası avluda çay, simit, tanışma. Duyurular kanalda. Aileniz ve çocuklarınızla gelin.</p>
        </section>

        <section className="rounded-2xl card border hairline px-4 py-3.5">
          <h2 className="font-semibold text-[16px] mb-1">Bizi takip edin</h2>
          <ul className="text-[15px]">
            <li><Dis href={BAGLANTILAR.telegramKanal} className="flex items-center justify-between py-2 tap"><span>✈️ Telegram · Kur'an Hayatında</span><span className="accent">›</span></Dis></li>
            <li><Dis href={BAGLANTILAR.x} className="flex items-center justify-between py-2 tap"><span>𝕏 @kuranhayatimda</span><span className="accent">›</span></Dis></li>
          </ul>
        </section>
        <p className="text-[12px] muted text-center pb-4 leading-snug">Bu sayfa ve kanal fetva vermez, para toplamaz. Yardımlaşma ayni, zaman ve yönlendirmeyle olur.</p>
      </div>
    </div>
  )
}
