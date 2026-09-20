import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'
export type Sort = 'mushaf' | 'nuzul'
export type Layer = 'okunus' | 'meal' | 'ar'
export interface Settings {
  theme: Theme
  sort: Sort
  showMealName: boolean
  fontSize: number
  latinFont: string
  arabicSize: number
  arabicFont: string
  layers: Layer[]
  hidden: Layer[]
}
export const LATIN_FONTS: { id: string; ad: string; css: string }[] = [
  { id: 'system', ad: 'Sistem', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { id: 'nunito', ad: 'Nunito', css: '"Nunito", sans-serif' },
  { id: 'baskerville', ad: 'Baskerville', css: '"Libre Baskerville", Baskerville, serif' },
  { id: 'georgia', ad: 'Georgia', css: 'Georgia, "Times New Roman", serif' },
  { id: 'helvetica', ad: 'Helvetica', css: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
]
export const ARABIC_FONTS: { id: string; ad: string; css: string }[] = [
  { id: 'amiri', ad: 'Amiri', css: '"Amiri", serif' },
  { id: 'scheherazade', ad: 'Scheherazade', css: '"Scheherazade New", serif' },
  { id: 'noto', ad: 'Noto Naskh', css: '"Noto Naskh Arabic", serif' },
]
const DEFAULTS: Settings = {
  theme: 'light', sort: 'nuzul', showMealName: false, fontSize: 16, latinFont: 'system',
  arabicSize: 26, arabicFont: 'amiri', layers: ['okunus', 'meal', 'ar'], hidden: [],
}
/** İlk ziyarette ekran genişliğine göre okunaklı bir yazı boyutu önerir (tablet/masaüstünde biraz daha büyük); kullanıcı "Aa" ile değiştirdikten sonra bu değer korunur, tekrar hesaplanmaz. */
function responsiveFontDefaults(): Pick<Settings, 'fontSize' | 'arabicSize'> {
  if (typeof window === 'undefined') return { fontSize: DEFAULTS.fontSize, arabicSize: DEFAULTS.arabicSize }
  const w = window.innerWidth
  if (w >= 1024) return { fontSize: 18, arabicSize: 30 }
  if (w >= 768) return { fontSize: 17, arabicSize: 28 }
  return { fontSize: DEFAULTS.fontSize, arabicSize: DEFAULTS.arabicSize }
}
const KEY = 'kh:settings'
function load(): Settings {
  const base = { ...DEFAULTS, ...responsiveFontDefaults() }
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...base, ...JSON.parse(raw) } } catch { /* yoksay */ }
  return base
}
const Ctx = createContext<{ s: Settings; set: (p: Partial<Settings>) => void }>({ s: DEFAULTS, set: () => {} })

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(load)
  const set = (p: Partial<Settings>) => setS(prev => { const n = { ...prev, ...p }; try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* yoksay */ } return n })
  useEffect(() => {
    const r = document.documentElement
    r.dataset.theme = s.theme
    r.style.setProperty('--size-latin', `${s.fontSize}px`)
    r.style.setProperty('--size-arabic', `${s.arabicSize}px`)
    r.style.setProperty('--font-latin', LATIN_FONTS.find(f => f.id === s.latinFont)?.css ?? LATIN_FONTS[0].css)
    r.style.setProperty('--font-arabic', ARABIC_FONTS.find(f => f.id === s.arabicFont)?.css ?? ARABIC_FONTS[0].css)
  }, [s])
  const v = useMemo(() => ({ s, set }), [s])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
export const useSettings = () => useContext(Ctx)
