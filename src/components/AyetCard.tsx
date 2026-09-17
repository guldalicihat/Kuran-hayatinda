import { Link } from 'react-router-dom'
import type { Ayah } from '../lib/types'
import { useSettings } from '../lib/settings'
import { useFavorites } from '../lib/store'

export default function AyetCard({ sure, ayet, meal, hasContent }: { sure: number; ayet: Ayah; meal?: string; hasContent: boolean }) {
  const { s } = useSettings()
  const { isFavorite, toggle } = useFavorites()
  const key = `${sure}:${ayet.n}`
  const fav = isFavorite(key)
  const layers = s.layers.filter(l => !s.hidden.includes(l))
  const parts = layers.map(l => {
    if (l === 'okunus') return <p key="o" className="okunus"><span className="muted mr-2 tabular-nums">{ayet.n}</span>{ayet.okunus}</p>
    if (l === 'meal') return (
      <p key="m" className="meal px-3">
        {meal ?? <span className="italic opacity-70">Kök temelli meal hazırlanıyor.</span>}
        {meal && s.showMealName && <span className="block text-xs mt-1 opacity-70">Kök temelli meal</span>}
      </p>
    )
    return <p key="a" className="arabic"><span className="text-[0.6em] muted mx-2 tabular-nums" style={{ fontFamily: 'var(--font-latin)' }}>{ayet.n}</span>{ayet.ar}</p>
  })
  const withDividers = parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <div key={`d${i}`} className="divider" />] : [p]))
  return (
    <Link to={`/sure/${sure}/${ayet.n}`} id={`a${ayet.n}`} className="relative block card pl-4 pr-10 py-4 border-b hairline tap">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(key) }}
        aria-label={fav ? 'Favorilerden kaldır' : 'Favorilere ekle'}
        className="absolute top-3 right-3 p-1 tap rounded-full"
        style={{ background: 'var(--bg)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" className={fav ? 'accent' : 'muted'}>
          <path d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.7.6 5 2.2C11.8 4.6 13.5 3.7 15.5 4c3.5.5 5 4 3.5 7.2-2.5 4.7-10 9.3-10 9.3z" strokeLinejoin="round" />
        </svg>
      </button>
      {withDividers}
      {hasContent && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] px-2 py-0.5 rounded-full accent" style={{ background: 'var(--accent-soft)' }}>Açıklama var</span>
        </div>
      )}
    </Link>
  )
}
