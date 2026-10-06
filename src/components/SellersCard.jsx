import { useParams } from "react-router-dom";
import { useApi, usd, paths } from "../api";
import Card from "./Card";
import PLink from "./PLink";
import SellersTable from "./SellersTable";

/* SC3 · Sellers: the main card. Answers "where can I buy this exact model?" with data from SELL_db. */
export default function SellersCard() {
  const { id } = useParams();
  const product = useApi(`/products/${encodeURIComponent(id)}`);
  const sellers = useApi(`/products/${encodeURIComponent(id)}/sellers`);
  const p = product.data;
  const pr = p?.prices;
  return (
    <Card level="Sellers" trail={p && { ...p.trail, id: p.id, sellers: "Sellers" }}
      back={p && { to: paths.product(id), label: p.title }}
      title={p ? `Where to buy ${p.title}` : ""}
      loading={product.loading || sellers.loading} error={product.error || sellers.error}>
      {p && (
        <>
          <div className="prodbar">
            <div className="ph sm" />
            <dl className="mini">
              {[["Scale / brand", `${p.scale} ${p.brand}`], ["MPN", p.mpn], ["Year", p.year_label], ["Color", p.color]]
                .map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v ?? "—"}</dd></div>)}
            </dl>
            <div className="prodbar-side">
              {pr.sellers > 0 && <span>Avg <b>{usd(pr.avg)}</b></span>}
              <PLink to={paths.product(id)}>Fact sheet →</PLink>
            </div>
          </div>
          {sellers.data && <SellersTable sellers={sellers.data} />}
        </>
      )}
    </Card>
  );
}
