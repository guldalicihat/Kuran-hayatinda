// "Sor" sayfasının sıralama mantığı: modelsiz, cihazda çalışır.
// Soru -> konu sözlüğü (topics.json) + meal/açıklama metin eşleşmesi (content-search.json) -> ayet listesi.
import type { ContentSearchRow, TopicsData } from './types'

const TR: Record<string, string> = { 'â': 'a', 'î': 'i', 'û': 'u', 'I': 'ı', 'İ': 'i' }
export function normalize(s: string): string {
  return s.replace(/[âîûIİ]/g, c => TR[c] ?? c).toLocaleLowerCase('tr').replace(/['’]/g, '').replace(/\s+/g, ' ').trim()
}

const STOP = new Set(['ve', 'ile', 'bir', 'bu', 'şu', 'o', 'ne', 'mi', 'mı', 'mu', 'mü', 'için', 'gibi', 'çok', 'ama', 'ben', 'bana', 'benim', 'beni',
  'sen', 'sana', 'biz', 'bize', 'onu', 'ona', 'da', 'de', 'ki', 'ya', 'hem', 'nasıl', 'neden', 'niye', 'olur', 'oldu', 'olan', 'var', 'yok', 'diye',
  'daha', 'en', 'hiç', 'her', 'şey', 'şeyi', 'zaman', 'bunu', 'şimdi', 'artık', 'kadar', 'sonra', 'önce', 'ise', 'ancak', 'yani', 'acaba', 'lazım', 'gerek',
  'istiyorum', 'düşünüyorum', 'yaşıyorum', 'ediyorum', 'yapıyorum', 'olmalı', 'mıyım', 'miyim', 'muyum', 'müyüm', 'kuran', 'kur', 'ayet', 'der', 'diyor', 'söylüyor', 'konuda', 'hakkında'])

export function tokens(q: string): string[] {
  return normalize(q).split(/[^a-zçğıöşü0-9]+/).filter(w => w.length >= 3 && !STOP.has(w))
}

/** Türkçe ekleri kabaca atar: kelimenin ilk 5 harfi (kısa kelimede tamamı). */
function stem(w: string): string { return w.length <= 5 ? w : w.slice(0, 5) }

const FOLD: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ü': 'u' }
/** Aksan/yumuşama farklarını yok sayan kaba biçim: borç->borc (borcumu), ortak->ortag (ortağım). */
export function fold(w: string): string { return w.replace(/[çğşıöü]/g, c => FOLD[c] ?? c) }
const SOFT: Record<string, string> = { 'k': 'g', 'p': 'b', 't': 'd', 'c': 'c' }

function matchesStem(token: string, anahtar: string): boolean {
  if (anahtar.includes(' ')) return false
  const a = fold(anahtar.trim()), t = fold(token)
  if (a.length < 3) return t === a
  if (a.length === 3) return t === a || (t.length <= 5 && t.startsWith(a))
  const forms = [a]
  const son = a[a.length - 1]
  if (SOFT[son] && SOFT[son] !== son) forms.push(a.slice(0, -1) + SOFT[son])
  return forms.some(f => t.startsWith(f)) || (t.length >= 4 && a.startsWith(t))
}

export interface TopicHit { id: string; ad: string; puan: number }
export interface VerseHit { sure: number; ayet: number; puan: number; konular: string[]; direkt: boolean }

export function scoreTopics(q: string, data: TopicsData): TopicHit[] {
  const toks = tokens(q)
  const nq = normalize(q)
  const out: TopicHit[] = []
  for (const k of data.konular) {
    let p = 0
    for (const a of k.anahtar) {
      if (a.includes(' ')) { if (nq.includes(a)) p += 3; continue }
      for (const t of toks) if (matchesStem(t, a)) { p += t === a ? 2 : 1.2 }
    }
    if (nq && normalize(k.ad).includes(nq)) p += 4
    if (p > 0) out.push({ id: k.id, ad: k.ad, puan: p })
  }
  return out.sort((x, y) => y.puan - x.puan).slice(0, 4)
}

/** content-search satırlarını bir kez normalleştirir (sayfa açılışında, useMemo ile). */
export type PreparedRow = [sure: number, ayet: number, meal: string, extra: string]
export function prepareRows(rows: ContentSearchRow[]): PreparedRow[] {
  return rows.map(([s, a, meal, extra]) => [s, a, normalize(meal), normalize(extra)])
}

export function rankVerses(q: string, data: TopicsData, rows: PreparedRow[], topicHits: TopicHit[]): VerseHit[] {
  const toks = tokens(q)
  const stems = Array.from(new Set(toks.map(stem).filter(x => x.length >= 4)))
  const acc = new Map<string, VerseHit>()
  const add = (s: number, a: number, puan: number, konu?: string, direkt = false) => {
    const key = `${s}:${a}`
    const h = acc.get(key) ?? { sure: s, ayet: a, puan: 0, konular: [], direkt: false }
    h.puan += puan
    if (konu && !h.konular.includes(konu)) h.konular.push(konu)
    if (direkt) h.direkt = true
    acc.set(key, h)
  }
  // 1) konu eşleşmesi: konu puanı x ayet puanı (konu içinde en yükseğe göre ölçekli)
  const maxTopic = topicHits[0]?.puan || 1
  for (const th of topicHits) {
    const k = data.konular.find(x => x.id === th.id)
    if (!k) continue
    const best = k.ayetler[0]?.[2] || 1
    for (const [s, a, p] of k.ayetler) add(s, a, 10 * (th.puan / maxTopic) * (p / best), k.ad)
  }
  // 2) doğrudan metin eşleşmesi: soru kelimeleri meal/açıklamada geçiyorsa
  if (stems.length) {
    for (const [s, a, nm, nx] of rows) {
      let p = 0
      let hits = 0
      for (const st of stems) {
        if (nm.includes(st)) { p += 3; hits++ }
        else if (nx.includes(st)) { p += 1.2; hits++ }
      }
      if (hits) add(s, a, p * (hits === stems.length ? 1.5 : 1), undefined, true)
    }
  }
  return Array.from(acc.values()).sort((x, y) => y.puan - x.puan || x.sure - y.sure || x.ayet - y.ayet).slice(0, 12)
}
