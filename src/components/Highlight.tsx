import { norm } from '../lib/arama'

export default function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const nText = norm(text), nq = norm(q)
  const i = nText.indexOf(nq)
  if (i < 0) return <>{text}</>
  return <>{text.slice(0, i)}<mark className="bg-transparent font-semibold" style={{ color: 'var(--accent)' }}>{text.slice(i, i + nq.length)}</mark>{text.slice(i + nq.length)}</>
}
