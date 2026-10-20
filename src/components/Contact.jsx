import { useEffect, useRef, useState } from "react";
import { STATIC } from "../api";
import { useSeo } from "../seo";

/* "SEND US A MESSAGE" (Contact sheet). The message is saved by the API (POST /api/contact).
   Cloudflare Turnstile is used when VITE_TURNSTILE_SITEKEY is set; without it the form relies on a hidden trap field. */
const TOPICS = ["General question", "Report an error in a model", "Seller or link problem", "Suggestion", "Other"];
const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY;

export default function Contact() {
  useSeo("Contact us");
  const [f, setF] = useState({ topic: "", name: "", email: "", message: "", consent: false, website: "" });
  const [state, setState] = useState("idle");
  const [token, setToken] = useState("");
  const box = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  useEffect(() => {
    if (!SITEKEY || STATIC) return;
    const draw = () => window.turnstile?.render(box.current, { sitekey: SITEKEY, callback: setToken });
    if (window.turnstile) { draw(); return; }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.onload = draw; document.head.appendChild(s);
  }, []);

  const ok = f.topic && f.name.trim() && /^\S+@\S+\.\S+$/.test(f.email) && f.message.trim().length >= 10 && f.consent && (!SITEKEY || token);
  const send = async () => {
    if (STATIC) { setState("demo"); return; }
    setState("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, token }) });
      setState(r.ok ? "sent" : "error");
    } catch { setState("error"); }
  };

  if (state === "sent") return <main className="card info"><h1>Thank you!</h1><p>Your message was sent. We will read it soon.</p></main>;
  return (
    <main className="card info">
      <div className="contact">
        <h1>SEND US A MESSAGE</h1>
        <label>What is this about? *
          <select value={f.topic} onChange={set("topic")}><option value="" />{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <div className="two">
          <label>Your name *<input value={f.name} onChange={set("name")} maxLength={80} /></label>
          <label>Your email *<input type="email" value={f.email} onChange={set("email")} maxLength={120} /></label>
        </div>
        <label>Your message *
          <textarea rows={6} maxLength={3000} value={f.message} onChange={set("message")}
            placeholder="Share the details — what you are asking about, model names, order numbers if relevant." /></label>
        <input className="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} />
        <label className="check"><input type="checkbox" checked={f.consent} onChange={set("consent")} />
          I agree to the processing of my data for the purpose of this inquiry.</label>
        {SITEKEY && !STATIC && <div ref={box} />}
        <button type="button" className="btn" disabled={!ok || state === "sending"} onClick={send}>{state === "sending" ? "Sending…" : "Send message"}</button>
        {state === "error" && <p className="note">Your message could not be sent. Please try again.</p>}
        {state === "demo" && <p className="note">The contact form works on the live site, not in the demo.</p>}
      </div>
    </main>
  );
}
