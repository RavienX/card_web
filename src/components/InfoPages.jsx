import { Link } from "react-router-dom";
import { useSeo } from "../seo";
import { ABOUT } from "../legalText";

/* About us and the legal pages (texts in src/legalText.js). A page without text says it is under development. */
export function About() {
  useSeo("About us");
  return (
    <main className="card info">
      <h1>About us</h1>
      {ABOUT.map((t) => <p key={t}>{t}</p>)}
    </main>
  );
}

export function Legal({ title, blocks, justify = false }) {
  useSeo(title);
  return (
    <main className={`card info legal${justify ? " just" : ""}`}>
      <h1>{title}</h1>
      {blocks
        ? blocks.map(([tag, text], i) => (tag === "h2" ? <h2 key={i}>{text}</h2> : tag === "h3" ? <h3 key={i}>{text}</h3> : <p key={i}>{text}</p>))
        : <p>This page is under development.</p>}
      <p><Link to="/">← Back to the catalog</Link></p>
    </main>
  );
}
