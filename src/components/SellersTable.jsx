import { usd, goUrl } from "../api";

const COLS = ["Seller", "Shipping", "Point of sale", "Condition", "Returns", "Price (original)", "Price (US$)", ""];

/* SC3 list (SELL_db). "Get it" goes through the API: it records the selected seller (SC7) and
   redirects straight to the seller's own page. */
export default function SellersTable({ sellers }) {
  if (!sellers.length) return <p className="note">No sellers listed for this model yet.</p>;
  const open = sellers.filter((x) => x.status === "available");
  const from = Math.min(...open.map((x) => x.price_usd ?? Infinity));
  return (
    <>
      <p className="summary">
        <b>{open.length}</b> available of {sellers.length} sellers
        {Number.isFinite(from) && <> · from <b>{usd(from)}</b></>}
      </p>
      <div className="table">
        <div className="tr th">{COLS.map((c, i) => <span key={i}>{c}</span>)}</div>
        {sellers.map((x) => (
          <div className="tr" key={x.id}>
            <span data-l="Seller"><b>{x.name}</b></span>
            <span data-l="Shipping">{x.shipping ?? "—"}</span>
            <span data-l="Point of sale">{x.channel ?? "—"}</span>
            <span data-l="Condition">{x.condition ?? "—"}</span>
            <span data-l="Returns">{x.returns ?? "—"}</span>
            <span data-l="Price (original)">{x.price_label ?? "—"}</span>
            <span data-l="Price (US$)">{usd(x.price_usd)}</span>
            <span className="act">
              {x.status === "available"
                ? <a className="btn" href={x.url ?? goUrl(x.id)} target="_blank" rel="noopener noreferrer sponsored">Get it</a>
                : <span className="pill">{x.status_label ?? "Not available"}</span>}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
