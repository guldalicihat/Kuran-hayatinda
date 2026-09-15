export default function FilterInput({ value, onChange, placeholder = 'Filtrele' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="px-4 py-2">
      <label className="flex items-center gap-2 rounded-xl px-3 py-2 card border hairline">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="muted"><path d="M10.5 4a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM15.5 15.5L21 21" /></svg>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[16px]" />
        {value && <button onClick={() => onChange('')} className="muted text-sm tap">Temizle</button>}
      </label>
    </div>
  )
}
