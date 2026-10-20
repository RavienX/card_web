import PLink from "./PLink";

/* Car list from top to bottom (L1 / L2 of the EXAMPLE workbook): the name on the left, the picture on the right.
   The picture is a placeholder until PROD_db has an image for the item. */
export default function Rows({ items }) {
  return (
    <ul className="rows">
      {items.map((i) => (
        <li key={i.key}>
          <PLink to={i.to} warm={i.warm}>
            <span><span className="t">{i.title}</span>{i.meta && <span className="meta">{i.meta}</span>}</span>
            <span className="ph" aria-hidden="true" />
          </PLink>
        </li>
      ))}
    </ul>
  );
}
