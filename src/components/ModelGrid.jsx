import { useState } from "react";
import { useParams } from "react-router-dom";
import { useApi, paths, productApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import PLink from "./PLink";

/* GO (or no status) -> "Find sellers"; STOCK OUT / ENDED / PRE-ORDER / N/A -> the status itself. */
function Action({ m }) {
  return m.status === "GO"
    ? <PLink className="btn sm" to={paths.sellers(m.id)} warm={productApi(m.id)}>Find sellers</PLink>
    : <span className="pill">{m.status}</span>;
}

/* Model, Year and Color always show; the rest only when the model has them. */
export function ModelCard({ m }) {
  const rows = [
    ["Model", m.model, true], ["Version", m.version], ["Version 2", m.version2], ["Version 3", m.version3],
    ["Body style", m.body_style], ["Coach builder", m.coachbuilder], ["Race details", m.race_details],
    ["Year", m.year_label, true], ["Color", m.color, true],
  ].filter(([, v, always]) => v || always);
  return (
    <article className="mcard">
      <div className="ph" />
      <h3><PLink to={paths.product(m.id)} warm={productApi(m.id)}>{m.title}</PLink></h3>
      <dl className="mini">
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v ?? "—"}</dd></div>)}
      </dl>
      <div className="foot-row">
        <Action m={m} />
        <span className="mpn">{m.mpn ?? ""}</span>
      </div>
    </article>
  );
}

const HEAD = ["", "MPN", "Model", "Version", "Version 2", "Version 3", "Coach builder", "Race details", "Year", "Color", ""];
const cell = (label, v) => <span data-l={label} className={v ? undefined : "na"}>{v || "—"}</span>;

/* The C20 list: one row per model, all the columns of the Specific workbook. */
function ModelTable({ rows }) {
  return (
    <div className="mtable">
      <div className="mt-row th">{HEAD.map((h, i) => <span key={i}>{h}</span>)}</div>
      {rows.map((m) => (
        <div className="mt-row" key={m.id}>
          <span className="ph sm" />
          {cell("MPN", m.mpn)}
          <span data-l="Model">
            <PLink className="stretch" to={paths.product(m.id)} warm={productApi(m.id)}><b>{m.model}</b></PLink>
          </span>
          {cell("Version", m.version)}
          {cell("Version 2", m.version2)}
          {cell("Version 3", m.version3)}
          {cell("Coach builder", m.coachbuilder)}
          {cell("Race details", m.race_details)}
          {cell("Year", m.year_label)}
          {cell("Color", m.color)}
          <span className="act"><Action m={m} /></span>
        </div>
      ))}
    </div>
  );
}

/* Every model of the chosen series (or subseries), as cards or as a list. */
export default function ModelGrid() {
  const { scale, brand, mark, series, subseries } = useParams();
  const [view, setView] = useState("cards");
  const { data, error, loading } = useApi("/models", { scale, brand, mark, series, ...(subseries ? { subseries } : {}) });
  const back = subseries
    ? { to: paths.subseries(scale, brand, mark, series), label: heading({ scale, brand, mark, series }) }
    : { to: paths.series(scale, brand, mark), label: heading({ scale, brand, mark }) };
  return (
    <Card level="Models" trail={{ scale, brand, mark, series, subseries }}
      title={heading({ scale, brand, mark, series, subseries })} back={back} loading={loading} error={error}
      empty={data?.length === 0 && "No models here yet."}>
      <div className="toolbar">
        <span className="count">{data?.length} models</span>
        <div className="seg sm" role="tablist" aria-label="View">
          {[["cards", "Cards"], ["list", "List"]].map(([v, label]) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
      </div>
      {view === "cards"
        ? <div className="mgrid">{data?.map((m) => <ModelCard key={m.id} m={m} />)}</div>
        : <ModelTable rows={data ?? []} />}
    </Card>
  );
}
