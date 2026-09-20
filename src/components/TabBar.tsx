import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', ad: 'Sureler', icon: <path d="M4 5.5C7 4 9.5 4 12 5.5c2.5-1.5 5-1.5 8 0v13c-3-1.5-5.5-1.5-8 0-2.5-1.5-5-1.5-8 0zM12 5.5v13" /> },
  { to: '/sor', ad: 'Sor', icon: <path d="M4 5h16v11H9l-5 4z M9 9h6 M9 12h4" /> },
  { to: '/favorilerim', ad: 'Favorilerim', icon: <path d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.7.6 5 2.2C11.8 4.6 13.5 3.7 15.5 4c3.5.5 5 4 3.5 7.2-2.5 4.7-10 9.3-10 9.3z" strokeLinejoin="round" /> },
  { to: '/topluluk', ad: 'Topluluk', icon: <><circle cx="9" cy="8" r="3.2" /><circle cx="16.5" cy="9.5" r="2.6" /><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M14.5 14.2c2.9.2 5.5 2 5.5 4.8" /></> },
  { to: '/ayarlar', ad: 'Ayarlar', icon: <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /> },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-bar border-t hairline" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-[560px] md:max-w-[700px] lg:max-w-[860px] flex justify-around">
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
