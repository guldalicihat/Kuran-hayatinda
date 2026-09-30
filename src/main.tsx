import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'
import { SettingsProvider } from './lib/settings'

registerSW({ immediate: true })

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// iOS Safari'nin (özellikle ana ekrana eklenmiş bağımsız/PWA modda) ekranın
// sol kenarından sağa kaydırma "geri" jesti, tek sayfa uygulamalarının hash
// tabanlı gezinmesiyle güvenilir çalışmıyor (WebKit'in bilinen bir
// davranışı: React Router'ın history yönetimini atlayıp/bozarak fazladan
// adım atlayabiliyor). Jesti kaynağında (kenara yakın dokunuşta) engelleyip
// kullanıcıyı her sayfadaki kendi "Geri" düğmesine yönlendiriyoruz; bu
// düğme aynı hash geçmişini kullanır ama uygulama içinde test edilmiştir.
window.addEventListener('touchstart', e => {
  if (e.touches.length !== 1 || e.touches[0].clientX >= 20) return
  // Geri düğmesi (veya başka bir tıklanabilir öğe) tam kenara yakın
  // durabiliyor; onun üzerindeki dokunuşu engellemeyelim, sadece boş
  // alandaki kenar dokunuşunu (asıl jest burada başlar) engelleyelim.
  const target = e.target as HTMLElement | null
  if (target?.closest('button, a, input, [role="button"]')) return
  e.preventDefault()
}, { passive: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </SettingsProvider>
  </StrictMode>,
)
