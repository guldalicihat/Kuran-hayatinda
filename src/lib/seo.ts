import { useEffect } from 'react'

const DEFAULT_TITLE = "Kur'an Hayatında"
const DEFAULT_DESCRIPTION = "Kur'an'ın tamamı için kök temelli Türkçe meal ve her ayetin günlük hayatla bağlantısını kuran açıklamalar."

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOg(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Sayfaya özel <title> ve meta description/OG etiketlerini ayarlar; sayfadan çıkınca varsayılana döner. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Kur'an Hayatında` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    document.title = fullTitle
    setMeta('description', desc)
    setOg('og:title', fullTitle)
    setOg('og:description', desc)
    return () => {
      document.title = DEFAULT_TITLE
      setMeta('description', DEFAULT_DESCRIPTION)
      setOg('og:title', DEFAULT_TITLE)
      setOg('og:description', DEFAULT_DESCRIPTION)
    }
  }, [title, description])
}
