import { Link, useParams } from "react-router-dom";
import { useApi, paths } from "../api";
import Card from "./Card";
import Pic from "./Pic";
import SellersTable from "./SellersTable";
import { SIDE, SpecTable } from "./ModelSpec";

/* SC7 · Seller selected (Specific workbook): the same model data as SC3, with only the chosen seller in the table.
   Its "Get it" is the last step: the API records the selection and sends the visitor to the seller. */
export default function SellerSelected() {
  const { id, sid } = useParams();
  const product = useApi(`/products/${encodeURIComponent(id)}`);
  const sellers = useApi(`/products/${encodeURIComponent(id)}/sellers`);
  const p = product.data;
  const chosen = sellers.data?.find((x) => x.id === sid);
  return (
    <Card level="Seller selected" trail={p && { ...p.trail, id: p.id, sellers: "Sellers", seller: chosen?.name }}
      back={p && { to: paths.sellers(id), label: "Sellers" }} side={p && [...SIDE(p), chosen ? `Seller: ${chosen.name}` : "Seller"]}
      title={p ? p.title : ""} seo={p && chosen && `Seller selected: ${chosen.name} - ${p.title}`}
      loading={product.loading || sellers.loading} error={product.error || sellers.error}>
      {p && (
        <>
          <div className="infobar"><SpecTable p={p} /><Pic src={p.pictures?.[0]} w={640} alt={p.title} className="ph big" /></div>
          {chosen
            ? <SellersTable sellers={[chosen]} productId={p.id} final />
            : <p className="note">This seller is no longer listed. <Link to={paths.sellers(id)}>See all sellers</Link></p>}
        </>
      )}
    </Card>
  );
}
