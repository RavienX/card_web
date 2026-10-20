/* The model's data table and the path lines of C21 and SC3 (Specific workbook): label + value rows, same on both cards. */
export const SPEC = (p) => [
  ["Scale", p.scale], ["Brand --- Marks", p.brand], ["Level / Marks", p.mark],
  ["Series (Subseries) / Sort / Style", p.series], ["Subserie / Subthemes / Theme", p.subseries],
  ["Models / Series # --- MPN / Mark", p.title], ["MPN (Main)", p.mpn],
  ["Casting name of the product", p.title], ["Color", p.color],
];
export const SIDE = (p) => ["Products & Collections", "Toys & Hobbies", "Scale Model by Brand", "Model Display / Vehicles / Cars",
  `${p.scale} / ${p.brand} / ${p.mpn}`, [p.mark, p.series].filter(Boolean).join(" / "), p.title];

export function SpecTable({ p }) {
  return (
    <dl className="spec">
      {SPEC(p).map(([k, v], i) => <div key={k + i}><dt>{k}</dt><dd>{v ?? "—"}</dd></div>)}
    </dl>
  );
}
