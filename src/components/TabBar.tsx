import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', ad: 'Sureler', icon: <path d="M4 5.5C7 4 9.5 4 12 5.5c2.5-1.5 5-1.5 8 0v13c-3-1.5-5.5-1.5-8 0-2.5-1.5-5-1.5-8 0zM12 5.5v13" /> },
  { to: '/etiketler', ad: 'Etiketler', icon: <path d="M3 12l9-9h9v9l-9 9zM16.5 7.5h.01" /> },
  { to: '/notlar', ad: 'Notlar', icon: <path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" /> },
  { to: '/ara', ad: 'Ara', icon: <path d="M10.5 4a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM15.5 15.5L21 21" /> },
  { to: '/ayarlar', ad: 'Ayarlar', icon: <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /> },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-bar border-t hairline" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-[560px] flex justify-around">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1.5 px-2 text-[11px] tap ${isActive ? 'accent' : 'muted'}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
            {t.ad}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
