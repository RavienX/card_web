import { Link } from "react-router-dom";

/* Black footer of the Specific workbook (261014c): the copyright and only 4 references. */
const LINKS = [["Privacy Policy", "/privacy"], ["Disclaimer", "/disclaimer"], ["About us", "/about"], ["Contact us", "/contact"]];
export default function Footer() {
  return (
    <footer className="site-foot">
      <p className="ft-copy">© Scalecar143.com and MODid. All rights reserved</p>
      <nav>{LINKS.map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}</nav>
    </footer>
  );
}
