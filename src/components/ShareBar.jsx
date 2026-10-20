import { useState } from "react";

/* Share this page's link on social media (plain share links, no SDK, nothing is loaded from those sites). */
const NETS = [
  { k: "Facebook", c: "#1877f2", t: "f", u: (l) => `https://www.facebook.com/sharer/sharer.php?u=${l}` },
  { k: "X", c: "#111111", t: "X", u: (l, t) => `https://twitter.com/intent/tweet?url=${l}&text=${t}` },
  { k: "WhatsApp", c: "#25d366", t: "W", u: (l, t) => `https://wa.me/?text=${t}%20${l}` },
  { k: "Telegram", c: "#229ed9", t: "T", u: (l, t) => `https://t.me/share/url?url=${l}&text=${t}` },
  { k: "Email", c: "#6b6b6b", t: "@", u: (l, t) => `mailto:?subject=${t}&body=${l}` },
];

export default function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const l = encodeURIComponent(url), t = encodeURIComponent(title);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.prompt("Copy this link", url); }
  };
  return (
    <div className="share">
      <span>Share</span>
      {NETS.map((n) => (
        <a key={n.k} href={n.u(l, t)} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${n.k}`} title={n.k}
          style={{ background: n.c }}>{n.t}</a>
      ))}
      <button type="button" onClick={copy}>{copied ? "Copied!" : "Copy link"}</button>
    </div>
  );
}
