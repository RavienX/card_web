import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from './Breadcrumb'
import { useSeo } from '../seo'
import { useSide } from '../sideContext'

/* Only show the loading skeleton if loading is slow; fast loads never flash it. */
function useDelayed(on, ms = 200) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => setShow(true), ms)
    return () => { clearTimeout(t); setShow(false) }
  }, [on, ms])
  return on && show
}

/* THE design. Built once; every level renders inside this shell. */
const FIXED = ['Products & Collections', 'Toys & Hobbies', 'Scale Model by Brand', 'Model Display / Vehicles / Cars']
const sideLines = (t) => [...FIXED, [t?.scale, t?.brand].filter(Boolean).join(' / '), [t?.mark, t?.series, t?.subseries].filter(Boolean).join(' / ')].filter(Boolean)

export default function Card({ level, trail, back, title, seo, side, wide, loading, error, empty, children }) {
  const slow = useDelayed(loading)
  useSide(level === 'Start' ? [] : (side ?? sideLines(trail)))
  useSeo(seo ?? (level === 'Start' ? 'Scale model finder' : title))
  return (
    <main className={`card${wide ? " wide" : ""}`}>
      <div className="card-head">
        <span className="tag">{level}</span>
        <Breadcrumb trail={trail} />
      </div>
      {back && <Link className="back" to={back.to}>← BACK to {back.label}</Link>}
      <h1>{title}</h1>
      {error ? <p className="note">Couldn't load this card. Is the API running?</p>
        : loading ? (slow ? <div className="skeleton" /> : null)
        : empty ? <p className="note">{empty}</p>
        : <div className="enter">
          {children}
          {level !== 'Start' && <p className="foot-brand">&gt;&gt;&gt; Chase, Find and Buy your Scale Model CAR Collection by MODid Catalog</p>}
        </div>}
    </main>
  )
}

export function Section({ title, rows, badge }) {
  return (
    <section className="sec">
      <h2>{title}{badge && <em>{badge}</em>}</h2>
      <dl>
        {rows.map(([k, v], i) => (
          <div key={k + i}><dt>{k}</dt><dd>{v ?? '—'}</dd></div>
        ))}
      </dl>
    </section>
  )
}
