import PLink from "./PLink";

/* C5 / C6 / C7 as in the Specific workbook: a title bar, the path already chosen as green panels (SCALE, BRAND, MARK, SERIE),
   and the list of the next level on the right. Only items that have models are listed (there is no catalog of empty ones). */
export default function Cascade({ title, chosen, label, items }) {
  return (
    <div className="cascade" style={{ "--n": chosen.length }}>
      <div className="cs-title">{title}</div>
      <div className="cs-head">
        {chosen.map((c) => <span key={c.k}>{c.k}</span>)}
        <span className="cur">{label}</span>
      </div>
      <div className="cs-body">
        {chosen.map((c) => <div key={c.k} className="panel">{c.v}</div>)}
        <ul className="cs-list">
          {items.map((i) => (
            <li key={i.key}>
              <PLink to={i.to} warm={i.warm}><span>{i.title}</span>{i.meta && <small>{i.meta}</small>}</PLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
