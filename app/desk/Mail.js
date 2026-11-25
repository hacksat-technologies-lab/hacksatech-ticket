"use client";
import { useEffect, useState } from "react";

// Email delivery tools on the desk: retry every ticket email that didn't go out,
// or find one ticket and resend it (optionally to a corrected address).
export default function Mail({ call }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null); // { ok, text }

  const run = async (key, fn) => {
    setBusy(key);
    setMsg(null);
    try { await fn(); } catch (x) { setMsg({ ok: false, text: x.message }); }
    setBusy("");
  };

  const loadPending = () => run("pending", async () => setPending(await call({ action: "pending" })));
  useEffect(() => { loadPending(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const search = (e) => {
    e.preventDefault();
    run("search", async () => {
      const j = await call({ action: "search", q });
      setFound(j.tickets.map((t) => ({ ...t, to: t.email })));
      if (!j.tickets.length) setMsg({ ok: false, text: "No ticket matches that." });
    });
  };

  const resend = (t) => run(t.id, async () => {
    const j = await call({ action: "resend", id: t.id, email: t.to });
    setFound((list) => list.map((x) => (x.id === t.id ? { ...j.ticket, to: j.ticket.email } : x)));
    setMsg(j.ok ? { ok: true, text: `Ticket sent to ${j.ticket.email}.` } : { ok: false, text: `Not sent: ${j.error}` });
    setPending(await call({ action: "pending" }));
  });

  const retryAll = () => run("retry", async () => {
    const j = await call({ action: "retryAll" });
    const parts = [`${j.sent} sent`];
    if (j.failed.length) parts.push(`${j.failed.length} failed (${j.failed[0].error})`);
    if (j.remaining) parts.push(`${j.remaining} still waiting`);
    setMsg({ ok: !j.failed.length, text: parts.join(", ") + "." });
    setPending(await call({ action: "pending" }));
  });

  const status = (e) => (e === "yes" ? ["Sent", "ok"] : e.startsWith("failed") ? ["Failed", "bad"] : ["Not sent", "bad"]);

  return (
    <>
      <h1 className="desk-h">Ticket emails</h1>

      <div className="desk-box">
        <div>
          <b>{pending ? pending.total : "…"}</b> {pending?.total === 1 ? "ticket hasn't" : "tickets haven't"} received their email yet.
        </div>
        {pending?.tickets?.length ? (
          <ul className="desk-list">
            {pending.tickets.slice(0, 5).map((t) => <li key={t.id}>{t.name} <span className="muted">{t.email}</span></li>)}
            {pending.total > 5 && <li className="muted">and {pending.total - 5} more</li>}
          </ul>
        ) : null}
        <button type="button" className="btn full" disabled={!!busy || !pending?.total} onClick={retryAll}>
          {busy === "retry" ? "Sending…" : "Retry unsent emails"}
        </button>
      </div>

      <form className="desk-search" onSubmit={search}>
        <label>Find a ticket to resend
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ticket ID, email or phone" />
        </label>
        <button className="btn" disabled={!!busy}>{busy === "search" ? "…" : "Find"}</button>
      </form>

      {msg && <div className={msg.ok ? "desk-ok" : "err"} role="status">{msg.text}</div>}

      {found?.map((t) => {
        const [label, cls] = status(t.emailed);
        return (
          <div className="desk-box" key={t.id}>
            <div className="desk-tk">
              <div><b>{t.name}</b><div className="muted small">{t.tier} · <span className="desk-id">{t.id}</span></div></div>
              <span className={`desk-pill ${cls}`} title={t.emailed}>{label}</span>
            </div>
            <label>Send to
              <input type="email" value={t.to} onChange={(e) => setFound((l) => l.map((x) => (x.id === t.id ? { ...x, to: e.target.value } : x)))} placeholder="Their email address" />
            </label>
            <button type="button" className="btn full" disabled={!!busy || !t.to} onClick={() => resend(t)}>
              {busy === t.id ? "Sending…" : t.to !== t.email ? "Save address & send" : "Resend ticket"}
            </button>
          </div>
        );
      })}
    </>
  );
}
