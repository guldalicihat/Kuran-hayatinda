import { useState } from 'react'
import { useInstallPrompt } from '../lib/installPrompt'

const DISMISS_KEY = 'kh:install-dismissed'

export default function InstallBanner() {
  const { canInstall, installed, isIOS, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })
  const [showIosHelp, setShowIosHelp] = useState(false)

  if (installed || dismissed) return null
  if (!canInstall && !isIOS) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* yoksay */ }
    setDismissed(true)
  }

  return (
    <div className="mx-4 mb-2 rounded-xl px-4 py-3" style={{ background: 'var(--accent-soft)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-[15px]">Uygulamayı ana ekranına ekle</p>
          <p className="muted text-[13px]">Tek dokunuşla aç, tam ekran oku.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <button onClick={promptInstall} className="bg-accent text-white px-3 py-1.5 rounded-lg text-[14px] tap">
              Ekle
            </button>
          )}
          {isIOS && !canInstall && (
            <button onClick={() => setShowIosHelp(v => !v)} className="accent px-3 py-1.5 rounded-lg text-[14px] border hairline tap">
              Nasıl?
            </button>
          )}
          <button onClick={dismiss} aria-label="Kapat" className="muted px-1 tap">✕</button>
        </div>
      </div>
      {showIosHelp && (
        <p className="muted text-[13px] mt-2 leading-snug">
          Safari'de alttaki <strong>Paylaş</strong> (kare + yukarı ok) simgesine dokun, sonra <strong>"Ana Ekrana Ekle"</strong>yi seç.
        </p>
      )}
    </div>
  )
}
