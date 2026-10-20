import { useParams } from "react-router-dom";
import { useApi, paths } from "../api";
import { sellersTitle } from "../seo";
import Card from "./Card";
import Pic from "./Pic";
import SellersTable from "./SellersTable";
import { SIDE, SpecTable } from "./ModelSpec";

/* SC3 · Sellers (Specific workbook): path lines on the right, the model's data table with its picture, then the sellers table. */
export default function SellersCard() {
  const { id } = useParams();
  const product = useApi(`/products/${encodeURIComponent(id)}`);
  const sellers = useApi(`/products/${encodeURIComponent(id)}/sellers`);
  const p = product.data;
  return (
    <Card level="Sellers" trail={p && { ...p.trail, id: p.id, sellers: "Sellers" }}
      back={p && { to: paths.product(id), label: p.title }} side={p && [...SIDE(p), "Sellers"]}
      title={p ? p.title : ""} seo={p && sellersTitle(p)}
      loading={product.loading || sellers.loading} error={product.error || sellers.error}>
      {p && (
        <>
          <div className="infobar"><SpecTable p={p} /><Pic src={p.pictures?.[0]} w={640} alt={p.title} className="ph big" /></div>
          {sellers.data && <SellersTable sellers={sellers.data} productId={p.id} />}
        </>
      )}
    </Card>
  );
}
