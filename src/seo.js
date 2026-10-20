import { useEffect } from 'react'
import { STATIC } from './api'

const SITE = 'MODid'

function setTag(selector, make, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) { el = make(); document.head.appendChild(el) }
  el.setAttribute(attr, value)
}
const meta = (key, value, by = 'name') =>
  setTag(`meta[${by}="${key}"]`, () => Object.assign(document.createElement('meta'), { [by]: key }), 'content', value)

/** Keeps <title>, canonical and og tags in step with the card on screen (the server already sent them for the first load).
    The description is left alone: the server writes the richer one. The static demo is never indexed. */
export function useSeo(title) {
  useEffect(() => {
    if (!title) return
    const full = `${title} | ${SITE}`
    document.title = full
    meta('og:title', full, 'property')
    if (STATIC) { meta('robots', 'noindex, nofollow'); return }
    const url = `${window.location.origin}${window.location.pathname}`
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
    meta('og:url', url, 'property')
  }, [title])
}

/* Same wording as backend/seo.py: the model number and the best price are what people search for and click on. */
const from = (p) => (p.prices?.sellers > 0 && p.prices.min != null ? ` from US$ ${p.prices.min.toFixed(2)}` : '')
export const productTitle = (p) => `${p.title}${p.mpn ? ` ${p.mpn}` : ''}${from(p) ? ` –${from(p)}` : ''}`
export const sellersTitle = (p) => `Buy ${p.title}${p.mpn ? ` ${p.mpn}` : ''}${from(p) ? ` –${from(p)}` : ''}`
