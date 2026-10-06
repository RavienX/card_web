import { useEffect, useState } from 'react'

const enc = encodeURIComponent

/* Demo mode (npm run build:pages): no backend. The answers of the API are saved in src/data/static.json
   (made by backend/export_static.py) and looked up here instead of fetched. */
export const STATIC = import.meta.env.MODE === 'pages'

/** Same canonical key as key() in backend/export_static.py: path + sorted [name, value] pairs as compact JSON. */
export function canon(url) {
  const u = new URL(url, 'http://x')
  const pairs = [...u.searchParams.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return decodeURIComponent(u.pathname) + (pairs.length ? `?${JSON.stringify(pairs)}` : '')
}

export function buildUrl(path, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return `/api${path}${qs ? `?${qs}` : ''}`
}

async function get(url) {
  if (STATIC) {
    const { default: data } = await import('./data/static.json')
    const hit = data[canon(url)]
    if (hit === undefined) throw new Error('404')
    return hit
  }
  const r = await fetch(url)
  if (!r.ok) throw new Error(r.status)
  return r.json()
}

/* In-memory cache + de-duplication: revisiting a card (or going back through the
   breadcrumb) shows its data instantly instead of reloading it. */
const cache = new Map()
const inflight = new Map()

function load(url) {
  if (inflight.has(url)) return inflight.get(url)
  const p = get(url)
    .then((data) => { cache.set(url, data); return data })
    .finally(() => inflight.delete(url))
  inflight.set(url, p)
  return p
}

/** Warm the cache before the click (hover / focus / touch). */
export const prefetch = (url) => { if (!cache.has(url)) load(url).catch(() => {}) }

/** { data, error, loading } for a GET. Cached data shows immediately and is refreshed quietly. */
export function useApi(path, params = {}) {
  const url = buildUrl(path, params)
  const [res, setRes] = useState({ url: null, data: null, error: false })

  useEffect(() => {
    let live = true
    load(url)
      .then((data) => live && setRes({ url, data, error: false }))
      .catch(() => live && setRes({ url, data: null, error: true }))
    return () => { live = false }
  }, [url])

  const fresh = res.url === url // ignore a stale answer while the next one loads
  const data = (fresh && res.data) || cache.get(url) || null
  const error = fresh && res.error && !data
  return { data, error, loading: !data && !error }
}

export const usd = (n) => (n == null ? '—' : `US$ ${n.toFixed(2)}`)

/** One place that knows every URL, so components and Breadcrumb never drift apart. */
export const paths = {
  start: (scale) => (scale ? `/?scale=${enc(scale)}` : '/'),
  marks: (s, b) => `/browse/${enc(s)}/${enc(b)}`,
  series: (s, b, m) => `${paths.marks(s, b)}/${enc(m)}`,
  subseries: (s, b, m, se) => `${paths.series(s, b, m)}/${enc(se)}`,
  models: (s, b, m, se, sub) => `/models/${enc(s)}/${enc(b)}/${enc(m)}/${enc(se)}${sub ? `/${enc(sub)}` : ''}`,
  product: (id) => `/product/${enc(id)}`,
  sellers: (id) => `/product/${enc(id)}/sellers`,
}

/* API urls, built in one place so prefetching hits exactly the cache key the page will use. */
export const marksApi = (s, b) => buildUrl('/marks', { scale: s, brand: b })
export const seriesApi = (s, b, m) => buildUrl('/series', { scale: s, brand: b, mark: m })
export const subseriesApi = (s, b, m, se) => buildUrl('/subseries', { scale: s, brand: b, mark: m, series: se })
export const modelsApi = (s, b, m, se, sub) =>
  buildUrl('/models', { scale: s, brand: b, mark: m, series: se, ...(sub ? { subseries: sub } : {}) })

/** "Get it": the API records which seller was selected (SC7) and redirects straight to the seller. */
export const goUrl = (listingId) => `/api/go/${enc(listingId)}`

/** API urls a product page needs, for prefetching. */
export const productApi = (id) => [
  buildUrl(`/products/${enc(id)}`),
  buildUrl(`/products/${enc(id)}/sellers`),
]
