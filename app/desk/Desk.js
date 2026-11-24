"use client";
import { useEffect, useState } from "react";
import { TIERS, EVENT, naira } from "@/lib/event";

const KEY = "hc-desk"; // passcode lives in this tab only, gone when the tab closes
const blank = { tier: "regular", name: "", phone: "", email: "", school: "", amount: "3000" };

// 0810 000 0000 -> 2348100000000 for WhatsApp links
const intl = (p) => {
  const d = String(p).replace(/\D/g, "");
  return d.startsWith("0") ? "234" + d.slice(1) : d;
};

export default function Desk() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);
  const t = TIERS.find((x) => x.id === f.tier);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) { setCode(saved); setUnlocked(true); }
    } catch {}
  }, []);

  async function call(body) {
    const r = await fetch("/api/desk", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-desk-passcode": code },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { lock(); throw new Error(j.error || "Wrong passcode."); }
    if (!r.ok) throw new Error(j.error || "Something went wrong.");
    return j;
  }

  async function unlock(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await call({ check: true });
      try { sessionStorage.setItem(KEY, code); } catch {}
      setUnlocked(true);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  function lock() {
    try { sessionStorage.removeItem(KEY); } catch {}
    setUnlocked(false); setCode(""); setDone(null);
  }

  async function issue(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      setDone(await call(f));
      setCopied(false);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (x) => setF({ ...f, tier: x.id, amount: String(x.price) });
  const next = () => { setDone(null); setF({ ...blank, tier: f.tier, amount: f.amount }); setErr(""); };

  if (!unlocked) {
    return (
      <form className="sheet glass desk-card" onSubmit={unlock}>
        <img className="desk-logo" src="/logo-white.png" alt="Hacksat" width="122" height="112" />
        <h1 className="desk-h">Ticket desk</h1>
        <p className="muted small">For staff issuing tickets to people who paid cash.</p>
        <label>Passcode
          <input type="password" required autoFocus autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn full" disabled={busy}>{busy ? "Checking…" : "Open desk"}</button>
      </form>
    );
  }

  if (done) {
    const msg = `Hi ${done.name.split(" ")[0]}, here is your ${EVENT.name} ${EVENT.year} ticket (${done.tier}). Show the QR code at the entrance: ${done.url}`;
    return (
      <div className="sheet glass desk-card">
        <small className="muted">Ticket issued</small>
        <h1 className="desk-h">{done.name}</h1>
        <p className="muted small">{done.tier} · <b className="desk-id">{done.id}</b></p>
        <p className="small">{done.emailed ? "The ticket was also emailed to them." : "No email sent. Send the link on WhatsApp instead."}</p>
        <a className="btn full" href={`https://wa.me/${intl(done.phone)}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Send on WhatsApp</a>
        <div className="desk-row">
          <a className="glass btn-glass" href={`/t/${done.id}`} target="_blank" rel="noopener">Open ticket</a>
          <button type="button" className="glass btn-glass" onClick={() => navigator.clipboard?.writeText(done.url).then(() => setCopied(true))}>{copied ? "Copied" : "Copy link"}</button>
        </div>
        <button type="button" className="btn full desk-next" onClick={next}>Next sale</button>
      </div>
    );
  }

  return (
    <form className="sheet glass desk-card" onSubmit={issue}>
      <div className="sheet-head">
        <div>
          <small className="muted">Cash sale</small>
          <h1 className="desk-h">Issue a ticket</h1>
        </div>
        <button type="button" className="desk-lock" onClick={lock}>Lock</button>
      </div>

      <div className="desk-tiers" role="radiogroup" aria-label="Ticket type">
        {TIERS.map((x) => (
          <button type="button" key={x.id} role="radio" aria-checked={f.tier === x.id} aria-label={`${x.short}, ${naira(x.price)}`} className={f.tier === x.id ? "on" : ""} style={{ "--tc": x.color }} onClick={() => pick(x)}>
            <b>{x.short}</b><span>{naira(x.price)}</span>
          </button>
        ))}
      </div>

      <label>Full name
        <input required value={f.name} onChange={set("name")} placeholder="e.g. Amina Yusuf" />
      </label>
      <label>Phone number
        <input required type="tel" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="0810 000 0000" />
      </label>
      <label>Email address (optional)
        <input type="email" inputMode="email" value={f.email} onChange={set("email")} placeholder="Ticket is emailed if you add one" />
      </label>
      {t?.needsSchool && (
        <label>School name
          <input required value={f.school} onChange={set("school")} placeholder="Name of their school" />
        </label>
      )}
      <label>Cash received (₦)
        <input required inputMode="numeric" pattern="[0-9]*" value={f.amount} onChange={set("amount")} />
      </label>

      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn full" disabled={busy}>{busy ? "Issuing…" : `Issue ${t?.short || ""} ticket`}</button>
    </form>
  );
}
