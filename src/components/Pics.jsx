import { Link } from "react-router-dom";

/* The two static pictures between the card title and the table (C5, C6, C7 of the Specific workbook). */
export default function Pics({ a, b, to }) {
  const imgs = [a, b].map((src, i) => <img key={i} src={src} alt="Ferrari scale model by Matrix, 1:43" loading="lazy" />);
  return to
    ? <Link className="pics" to={to} aria-label="1:43 Matrix Ferrari">{imgs}</Link>
    : <div className="pics">{imgs}</div>;
}
