import { useState } from "react";
import { useParams } from "react-router-dom";
import { useApi, usd, paths, productApi, goUrl } from "../api";
import { productTitle } from "../seo";
import { heading } from "../labels";
import Card from "./Card";
import Pic from "./Pic";
import { SIDE, SpecTable } from "./ModelSpec";
import ShareBar from "./ShareBar";
import PLink from "./PLink";

/* Model card: fact sheet only. The sellers live in their own card (SC3). */
export default function ProductDetail() {
  const [sel, setSel] = useState(0);
  const { id } = useParams();
  const { data: p, error, loading } = useApi(`/products/${encodeURIComponent(id)}`);
  const t = p?.trail;
  const back = t && { to: paths.models(t.scale, t.brand, t.mark, t.series, t.subseries), label: heading(t) };

  return (
    <Card level="Model" trail={t && { ...t, id: p.id }} side={p && SIDE(p)} back={back} title={p?.title ?? ""} seo={p && productTitle(p)} loading={loading} error={error}>
      {p && (
        <>
          <div className="infobar">
            <SpecTable p={p} />
            <div>
              <Pic src={p.pictures?.[sel]} w={640} alt={p.title} className="ph big" />
              <div className="thumbs">
                {[0, 1, 2].map((i) => p.pictures?.[i]
                  ? <button type="button" key={i} className={i === sel ? "on" : ""} onClick={() => setSel(i)} aria-label={`Picture ${i + 1}`}>
                      <Pic src={p.pictures[i]} w={320} alt={`${p.title} - picture ${i + 1}`} className="ph" /></button>
                  : <Pic key={i} className="ph" />)}
              </div>
              <div className="forsale">
                <PLink to={paths.sellers(p.id)} warm={productApi(p.id)}>Find this model for sale easily here</PLink>
                <PLink className="box" to={paths.sellers(p.id)} warm={productApi(p.id)}>Check this out from Seller Stores !</PLink>
                <ShareBar title={p.title} />
                {p.best && <a className="btn get" href={goUrl(p.best.id)} target="_blank" rel="noopener noreferrer sponsored">
                  Get it · {usd(p.best.price_usd)} at {p.best.channel ?? p.best.name}</a>}
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
