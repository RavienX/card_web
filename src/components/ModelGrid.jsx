import { useParams } from "react-router-dom";
import { useApi, paths, productApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import Pic from "./Pic";
import PLink from "./PLink";

/* GO -> opens the fact sheet (C21), which leads to the sellers (SC3); STOCK OUT / ENDED / PRE-ORDER / N/A -> the status itself. */
const ST = { "STOCK OUT": "st-out", "PRE-ORDER": "st-pre", ENDED: "st-ended", "N/A": "st-na" };
function Action({ m }) {
  return m.status === "GO"
    ? <PLink className="btn sm get" to={paths.product(m.id)} warm={productApi(m.id)} title="Open the fact sheet (C21), then find sellers">GO</PLink>
    : <span className={`pill ${ST[m.status] ?? "st-end"}`}>{m.status === "N/A" ? "Not available (N/A)" : m.status}</span>;
}

const HEAD = ["Scale", "Brand", "MPN", "Mark", "Serie", "Subserie", "Mark", "Model", "Version", "Version 2", "Version 3", "Coach builder", "Race details", "Year", "Color", "Picture", ""];
const cell = (label, v) => <span data-l={label} className={v ? undefined : "na"}>{v || "—"}</span>;

/* The C20 list: one row per model, all the columns of the Specific workbook. */
function ModelTable({ rows, ctx }) {
  const c = (label, v) => <span data-l={label} className="ctx">{v || "—"}</span>;
  return (
    <div className="mtable">
      <div className="mt-row th">{HEAD.map((h, i) => <span key={i}>{h}</span>)}</div>
      {rows.map((m) => (
        <div className="mt-row" key={m.id}>
          {c("Scale", ctx.scale)}{c("Brand", ctx.brand)}
          {cell("MPN", m.mpn)}
          {c("Mark", ctx.mark)}{c("Serie", ctx.series)}{c("Subserie", ctx.subseries)}
          {cell("Mark", m.mark ?? ctx.mark)}
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
          <Pic src={m.pictures?.[0]} w={240} alt={m.title} className="ph sm" />
          <span className="act"><Action m={m} /></span>
        </div>
      ))}
    </div>
  );
}

/* Every model of the chosen series (or subseries), as a list. */
export default function ModelGrid() {
  const { scale, brand, mark, series, subseries } = useParams();
  const { data, error, loading } = useApi("/models", { scale, brand, mark, series, ...(subseries ? { subseries } : {}) });
  const back = subseries
    ? { to: paths.subseries(scale, brand, mark, series), label: heading({ scale, brand, mark, series }) }
    : { to: paths.series(scale, brand, mark), label: heading({ scale, brand, mark }) };
  return (
    <Card wide level="Models" trail={{ scale, brand, mark, series, subseries }}
      title={heading({ scale, brand, mark, series, subseries })} back={back} loading={loading} error={error}
      empty={data?.length === 0 && "No models here yet."}>
      <div className="cs-title">{`${scale} ${brand.toUpperCase()} ${mark.toUpperCase()} ${series}${subseries ? ` Subserie ${subseries}` : ""}`}</div>
      <div className="toolbar">
        <span className="count">{data?.length} models</span>
      </div>
      <ModelTable rows={data ?? []} ctx={{ scale, brand, mark, series, subseries }} />
    </Card>
  );
}
