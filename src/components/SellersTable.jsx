import { usd, goUrl, paths } from "../api";
import PLink from "./PLink";

// Columns of SC3 in the Specific workbook: SELLER, LOCATED IN, SHIPPING, POINT OF SALE, CONDITION, PRICE (Original), Price (US$), then Get it / Stock out / Pre-Order
const COLS = ["Seller", "Located in", "Shipping", "Point of sale", "Condition", "Price (original)", "Price (US$)", ""];
const STATUS = { "STOCK OUT": "Stock out", "PRE-ORDER": "Pre-Order", ENDED: "Ended" };
const PILL = { "STOCK OUT": "st-out", "PRE-ORDER": "st-pre" };
const statusText = (x) => STATUS[String(x.status_label).toUpperCase()] ?? x.status_label ?? "Not available";

/* SC3 list (SELL_db). "Get it" opens SC7 (Seller selected). On SC7 itself (final) it goes through the API, which records
   the selected seller and redirects to the seller's own page. */
export default function SellersTable({ sellers, productId, final = false }) {
  if (!sellers.length) return <p className="note">No sellers listed for this model yet.</p>;
  const open = sellers.filter((x) => x.status === "available");
  const days = sellers.map((x) => String(x.checked_at ?? "").slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const checked = days.length ? days.sort().at(-1) : null;
  const from = Math.min(...open.map((x) => x.price_usd ?? Infinity));
  return (
    <>
      {!final && <p className="summary">
        <b>{open.length}</b> available of {sellers.length} sellers
        {Number.isFinite(from) && <> · from <b>{usd(from)}</b></>}
      </p>}
      <div className="table">
        <div className="tr th">{COLS.map((c, i) => <span key={i}>{c}</span>)}</div>
        {sellers.map((x) => (
          <div className="tr" key={x.id}>
            <span data-l="Seller"><b>{x.name}</b></span>
            <span data-l="Located in">{x.located_in ?? "—"}</span>
            <span data-l="Shipping">{x.shipping ?? "—"}</span>
            <span data-l="Point of sale">{x.channel ?? "—"}</span>
            <span data-l="Condition">{x.condition ?? "—"}</span>
            <span data-l="Price (original)">{x.price_label ?? "—"}</span>
            <span data-l="Price (US$)">{usd(x.price_usd)}</span>
            <span className="act">
              {x.status === "available"
                ? (final
                  ? <a className="btn get" href={x.url ?? goUrl(x.id)} target="_blank" rel="noopener noreferrer sponsored">Get it</a>
                  : <PLink className="btn get" to={paths.seller(productId, x.id)}>Get it</PLink>)
                : <span className={`pill ${PILL[String(x.status_label).toUpperCase()] ?? "st-end"}`}>{statusText(x)}</span>}
            </span>
          </div>
        ))}
      </div>
      <p className="srcnote">
        Prices come from the sellers' own pages (eBay and other stores) and can change.
        {checked && <> Last checked: {checked}.</>}
      </p>
    </>
  );
}
