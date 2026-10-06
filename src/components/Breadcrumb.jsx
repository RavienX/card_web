import { Link } from "react-router-dom";
import { paths } from "../api";

/* Series links to the Subseries card when the trail has a subseries, otherwise straight to its models. */
const LEVELS = [
  ["scale", "Scale", (t) => paths.start(t.scale)],
  ["brand", "Brand", (t) => paths.marks(t.scale, t.brand)],
  ["mark", "Mark", (t) => paths.series(t.scale, t.brand, t.mark)],
  ["series", "Series", (t) => (t.subseries
    ? paths.subseries(t.scale, t.brand, t.mark, t.series)
    : paths.models(t.scale, t.brand, t.mark, t.series))],
  ["subseries", "Subseries", (t) => paths.models(t.scale, t.brand, t.mark, t.series, t.subseries)],
  ["model", "Model", (t) => t.id && paths.product(t.id)],
  ["sellers", "Sellers", (t) => t.id && paths.sellers(t.id)],
];

/** Scale > Brand > Mark > Series > (Subseries) > Model > Sellers. Every level before the current one links back. */
export default function Breadcrumb({ trail }) {
  const t = trail ?? {}; // null / undefined while a card is still loading
  const shown = LEVELS.filter(([key]) => t[key]);
  if (!shown.length) return null;
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {shown.map(([key, label, href], i) => {
          const current = i === shown.length - 1;
          const to = href?.(t);
          return (
            <li key={key} aria-current={current ? "page" : undefined}>
              {current || !to
                ? <span title={label}>{t[key]}</span>
                : <Link to={to} title={label}>{t[key]}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
