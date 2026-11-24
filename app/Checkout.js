"use client";
import { useEffect, useState } from "react";
import { TIERS, EVENT, naira } from "@/lib/event";

const empty = { name: "", phone: "", email: "", school: "" };

export default function Checkout() {
  const [tier, setTier] = useState(null);
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const t = TIERS.find((x) => x.id === tier);

  useEffect(() => {
    document.body.style.overflow = tier ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && !busy && setTier(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [tier, busy]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, tier }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      window.location.href = j.url;
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="tkts">
        {TIERS.map((x) => (
          <button key={x.id} className={`tkt tkt-${x.id}`} style={{ "--tc": x.color }} onClick={() => EVENT.salesOpen && setTier(x.id)} aria-label={`${x.name}, ${naira(x.price)}. Get this ticket`}>
            <span className="tkt-body">
              <span className="tkt-main">
                <i className="tkt-emblem" aria-hidden="true" />
                <span className="tkt-top"><span>{EVENT.name} {EVENT.year}</span><span>Admit one</span></span>
                <b className="tkt-name">{x.short}</b>
                <small className="tkt-blurb">{x.blurb}</small>
                <span className="tkt-meta">
                  <span><small>Date</small>{EVENT.dateShort}</span>
                  <span><small>Doors</small>{EVENT.timeLabel}</span>
                  <span><small>City</small>Yola</span>
                </span>
              </span>
              <span className="tkt-stub">
                <span className="tkt-price">{naira(x.price)}</span>
                <span className="tkt-go">Get ticket
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {t && (
        <div className="scrim" onClick={() => !busy && setTier(null)}>
          <form className="sheet glass" onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ "--tc": t.color }}>
            <div className="grab" />
            <div className="sheet-head">
              <div>
                <small className="muted">Your ticket</small>
                <h3>{t.name}</h3>
              </div>
              <div className="tier-price">{naira(t.price)}</div>
            </div>

            <label>Full name
              <input required autoComplete="name" value={f.name} onChange={set("name")} placeholder="e.g. Amina Yusuf" />
            </label>
            <label>Phone number
              <input required type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} placeholder="0810 000 0000" />
            </label>
            <label>Email address
              <input required type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} placeholder="you@example.com" />
            </label>
            {t.needsSchool && (
              <label>School name
                <input required value={f.school} onChange={set("school")} placeholder="Name of your school" />
              </label>
            )}

            {err && <div className="err" role="alert">{err}</div>}
            <button className="btn full" disabled={busy}>{busy ? "Opening secure payment…" : `Pay ${naira(t.price)}`}</button>
            <button type="button" className="link" onClick={() => setTier(null)} disabled={busy}>Choose a different ticket</button>
            <p className="muted small center-t">Secured by Paystack. Your ticket is emailed right after payment.</p>
          </form>
        </div>
      )}
    </>
  );
}
