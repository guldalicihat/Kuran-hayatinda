export default function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; ad: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl p-0.5 border hairline" style={{ background: 'var(--line)' }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`px-5 py-1.5 rounded-[10px] text-[15px] font-medium tap ${value === o.v ? 'card accent shadow-sm' : ''}`}>{o.ad}</button>
      ))}
    </div>
  )
}
