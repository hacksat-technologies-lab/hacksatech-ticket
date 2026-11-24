import { notFound } from "next/navigation";
import { findTicket } from "@/lib/sheets";
import { EVENT, getTier, naira } from "@/lib/event";
import CopyLink from "./CopyLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your ticket", robots: "noindex" };

export default async function TicketPage({ params }) {
  const { id } = await params;
  const t = await findTicket("id", decodeURIComponent(id)).catch(() => null);
  if (!t) notFound();
  const tier = getTier(t.tier) || { name: t.tier, color: "#3eb5ca" };
  const status = (t.status || "valid").toLowerCase();

  return (
    <main className="wrap center ticket-page">
      <div className="ticket" style={{ "--tc": tier.color }}>
        <div className="ticket-top">
          <img className="ticket-logo" src="/logo-white.png" alt="Hacksat" width="122" height="112" />
          <div className="ticket-title">{EVENT.name} <span>{EVENT.year}</span></div>
          <div className="ticket-meta">
            <span>{EVENT.dateLabel.replace("Saturday, ", "")}</span><span>{EVENT.timeLabel}</span>
          </div>
        </div>
        <div className="ticket-qr">
          <img src={`/t/${t.id}/qr`} width="240" height="240" alt={`QR code for ticket ${t.id}`} />
          <div className={`pill ${status}`}>{status === "valid" ? "Valid ticket" : status === "used" ? "Already used" : "Void"}</div>
        </div>
        <div className="ticket-info">
          <div className="who">{t.name}</div>
          <div className="small">{t.email}</div>
          <div className="row2">
            <div><div className="k">Ticket</div><div className="v">{tier.name}</div></div>
            <div><div className="k">Paid</div><div className="v">{naira(t.amount)}</div></div>
          </div>
          {t.school ? <div className="k" style={{ marginTop: 10 }}>School · <span className="v">{t.school}</span></div> : null}
          <div className="code">{t.id}</div>
        </div>
      </div>

      <a className="btn ticket-dl" href={`/t/${t.id}/image?download`} download={`hacksat-connect-${t.id}.png`}>
        Download ticket &amp; receipt
      </a>
      <div className="ticket-actions">
        <a className="glass btn-glass" href={EVENT.mapsUrl} target="_blank" rel="noopener">Get directions</a>
        <CopyLink />
      </div>
      <p className="muted small" style={{ textAlign: "center", maxWidth: 340 }}>
        {EVENT.venue}. Screenshot this page or keep your email handy. Show the QR code at the entrance.
      </p>
    </main>
  );
}
