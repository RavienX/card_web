import { useParams } from "react-router-dom";
import { useApi, usd, paths, productApi } from "../api";
import { heading } from "../labels";
import Card, { Section } from "./Card";
import PLink from "./PLink";

/* Model card: fact sheet only. The sellers live in their own card (SC3). */
export default function ProductDetail() {
  const { id } = useParams();
  const { data: p, error, loading } = useApi(`/products/${encodeURIComponent(id)}`);
  const pr = p?.prices;
  const t = p?.trail;
  const back = t && { to: paths.models(t.scale, t.brand, t.mark, t.series, t.subseries), label: heading(t) };

  return (
    <Card level="Model" trail={t && { ...t, id: p.id }} back={back} title={p?.title ?? ""} loading={loading} error={error}>
      {p && (
        <div className="split">
          <div>{p.sections.map((s) => <Section key={s.title} {...s} />)}</div>
          <aside>
            <div className="gallery">{[0, 1, 2].map((i) => <div key={i} className="ph" />)}</div>
            <div className="cta">
              <p>Do you like it? Search this model for sale easily here.</p>
              <PLink className="btn" to={paths.sellers(p.id)} warm={productApi(p.id)}>Find sellers</PLink>
            </div>
            {pr.sellers > 0 && (
              <>
                <Section title="Prices & supply" badge="Premium" rows={[
                  ["Sellers", pr.sellers],
                  ["Price min", usd(pr.min)], ["Price avg", usd(pr.avg)], ["Price max", usd(pr.max)]]} />
                {p.trending && <Section title="Trending price (avg)" badge="Premium"
                  rows={p.trending.map(([k, v]) => [k, usd(v)])} />}
              </>
            )}
          </aside>
        </div>
      )}
    </Card>
  );
}
