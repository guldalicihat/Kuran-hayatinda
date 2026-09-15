import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function Header({ title, back, backLabel, right }: { title: ReactNode; back?: string; backLabel?: string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-20 bg-bar border-b hairline safe-top">
      <div className="h-12 grid grid-cols-[1fr_auto_1fr] items-center px-2">
        <div className="justify-self-start min-w-0">
          {back !== undefined && (
            <button onClick={() => (back ? nav(back) : nav(-1))} className="accent flex items-center gap-0.5 text-[17px] tap max-w-full">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              <span className="truncate">{backLabel ?? 'Geri'}</span>
            </button>
          )}
        </div>
        <h1 className="text-[17px] font-semibold text-center truncate max-w-[60vw]">{title}</h1>
        <div className="justify-self-end">{right ?? <Link to="/ayarlar" className="accent text-[17px] tap px-1" aria-label="Yazı ayarları">Aa</Link>}</div>
      </div>
    </header>
  )
}
