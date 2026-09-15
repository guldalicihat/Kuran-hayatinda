import { Link } from 'react-router-dom'
import type { Ayah } from '../lib/types'
import { useSettings } from '../lib/settings'

export default function AyetCard({ sure, ayet, meal, hasContent, tags }: { sure: number; ayet: Ayah; meal?: string; hasContent: boolean; tags?: string[] }) {
  const { s } = useSettings()
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
    <Link to={`/sure/${sure}/${ayet.n}`} id={`a${ayet.n}`} className="block card px-4 py-4 border-b hairline tap">
      {withDividers}
      {(hasContent || (tags && tags.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          {hasContent && <span className="text-[11px] px-2 py-0.5 rounded-full accent" style={{ background: 'var(--accent-soft)' }}>Açıklama var</span>}
          {tags?.map(t => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full muted border hairline">#{t}</span>)}
        </div>
      )}
    </Link>
  )
}
