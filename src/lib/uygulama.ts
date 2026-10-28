/** Mağaza uygulaması (iOS / Android) ile ilgili küçük yardımcılar. */
import { BAGLANTILAR } from './baglantilar'

/** Site, mağaza uygulamasının içinde mi açıldı? (iOS: WKWebView kimliği / köprü · Android: TWA) */
export function uygulamaIcinde(): boolean {
  if (typeof window === 'undefined') return false
  return /KuranHayatindaApp/.test(navigator.userAgent) || '__khYerel' in window || document.referrer.startsWith('android-app://')
}

export type Cihaz = 'ios' | 'android' | 'masaustu'
export function cihaz(): Cihaz {
  if (typeof navigator === 'undefined') return 'masaustu'
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'masaustu'
}

/** Bu cihaz için mağaza adresi (yoksa boş). Masaüstünde App Store, yoksa Google Play. */
export function magazaAdresi(c: Cihaz = cihaz()): string {
  if (c === 'ios') return BAGLANTILAR.appStore
  if (c === 'android') return BAGLANTILAR.googlePlay
  return BAGLANTILAR.appStore || BAGLANTILAR.googlePlay
}
