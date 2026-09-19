import Header from '../components/Header'
import Segmented from '../components/Segmented'
import { ARABIC_FONTS, LATIN_FONTS, useSettings, type Layer } from '../lib/settings'

const LAYER_AD: Record<Layer, string> = { okunus: 'Okunuş', meal: 'Meal', ar: 'Arapça' }

function Row({ children }: { children: React.ReactNode }) { return <div className="card border-b hairline px-4 py-3">{children}</div> }
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className="w-[51px] h-[31px] rounded-full relative transition-colors tap" style={{ background: on ? 'var(--accent)' : 'var(--line)' }}>
      <span className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-all" style={{ left: on ? 22 : 2 }} />
    </button>
  )
}

export default function SettingsPage() {
  const { s, set } = useSettings()
  const move = (l: Layer, dir: -1 | 1) => {
    const i = s.layers.indexOf(l); const j = i + dir; if (j < 0 || j >= s.layers.length) return
    const arr = [...s.layers]; [arr[i], arr[j]] = [arr[j], arr[i]]; set({ layers: arr })
  }
  return (
    <div className="safe-bottom">
      <Header title="Ayarlar" right={<span />} />
      <Row><div className="flex justify-center"><Segmented value={s.theme} options={[{ v: 'light', ad: 'Aydınlık' }, { v: 'dark', ad: 'Karanlık' }]} onChange={theme => set({ theme })} /></div></Row>
      <Row><div className="flex justify-center"><Segmented value={s.sort} options={[{ v: 'mushaf', ad: 'Sure No' }, { v: 'nuzul', ad: 'İniş' }]} onChange={sort => set({ sort })} /></div></Row>
      <Row><div className="flex items-center justify-between"><span>Meal İsmini Göster</span><Toggle on={s.showMealName} onChange={v => set({ showMealName: v })} /></div></Row>
      <Row>
        <div className="flex items-center gap-3"><span className="w-20">Boyut</span>
          <input type="range" min={13} max={24} value={s.fontSize} onChange={e => set({ fontSize: Number(e.target.value) })} className="flex-1" />
          <span className="w-8 text-right tabular-nums">{s.fontSize}</span></div>
      </Row>
      <div className="card border-b hairline flex overflow-x-auto">
        {LATIN_FONTS.map(f => (
          <button key={f.id} onClick={() => set({ latinFont: f.id })} style={{ fontFamily: f.css }} className={`shrink-0 px-5 py-4 border-r hairline text-[17px] tap ${s.latinFont === f.id ? 'accent' : ''}`}>{f.ad}</button>
        ))}
      </div>
      <Row>
        <div className="flex items-center gap-3"><span className="w-20 leading-tight">Arapça Boyut</span>
          <input type="range" min={18} max={44} value={s.arabicSize} onChange={e => set({ arabicSize: Number(e.target.value) })} className="flex-1" />
          <span className="w-8 text-right tabular-nums">{s.arabicSize}</span></div>
      </Row>
      <div className="card border-b hairline flex overflow-x-auto">
        {ARABIC_FONTS.map(f => (
          <button key={f.id} onClick={() => set({ arabicFont: f.id })} className={`shrink-0 px-5 py-3 border-r hairline text-center tap ${s.arabicFont === f.id ? 'accent' : ''}`}>
            <span className="block text-[15px]">{f.ad}</span><span className="block text-[26px] leading-tight" style={{ fontFamily: f.css }}>القرآن</span>
          </button>
        ))}
      </div>
      <Row>
        <p className="mb-2">Ayet kartı sırası</p>
        <ul>
          {s.layers.map((l, i) => (
            <li key={l} className="flex items-center justify-between py-1.5">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!s.hidden.includes(l)} onChange={e => set({ hidden: e.target.checked ? s.hidden.filter(x => x !== l) : [...s.hidden, l] })} className="accent" />{LAYER_AD[l]}</label>
              <span className="flex gap-1">
                <button onClick={() => move(l, -1)} disabled={i === 0} className="px-3 py-1 rounded-lg border hairline disabled:opacity-30 tap">↑</button>
                <button onClick={() => move(l, 1)} disabled={i === s.layers.length - 1} className="px-3 py-1 rounded-lg border hairline disabled:opacity-30 tap">↓</button>
              </span>
            </li>
          ))}
        </ul>
      </Row>
      <Row>
        <p className="font-medium mb-1">Hakkında</p>
        <p className="text-sm muted leading-relaxed">Arapça metin: Tanzil Uthmani. Kelime kökleri: Quranic Arabic Corpus. Okunuş: harekeli metinden kurala dayalı üretim. Meal ve açıklamalar: doğrulanmış köklerden yapay zekâ desteğiyle hazırlanan metinler. Ayrıntı için depodaki KAYNAKLAR.md dosyasına bakın.</p>
      </Row>
    </div>
  )
}
