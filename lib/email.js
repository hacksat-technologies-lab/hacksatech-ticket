import { EVENT, getTier, naira } from "./event.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendTicketEmail(t, origin, opts = {}) {
  origin = String(origin).trim().replace(/\/+$/, "");
  const tier = getTier(t.tier);
  const link = `${origin}/t/${t.id}`;
  const html = `<!doctype html><html><body style="margin:0;background:#062a44;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#0b3a5c;border-radius:12px;overflow:hidden;color:#fff">
<tr><td style="background:${tier.color};padding:22px 24px">
<img src="${origin}/logo-white.png" width="44" height="40" alt="Hacksat" style="display:block;margin-bottom:10px">
<div style="font-size:26px;font-weight:800;line-height:1.1">${esc(EVENT.name)} ${EVENT.year}</div>
<div style="font-size:13px;opacity:.95;margin-top:4px">${esc(EVENT.tagline)}</div></td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 4px;font-size:16px">Hi ${esc(t.name.split(" ")[0])}, you're in.</p>
<p style="margin:0 0 18px;font-size:14px;opacity:.85">Show this QR code at the entrance.</p>
<div style="background:#fff;border-radius:12px;padding:16px;text-align:center">
<img src="${origin}/t/${t.id}/qr" width="220" height="220" alt="Ticket QR code" style="display:block;margin:0 auto">
<div style="color:#062a44;font-weight:700;font-size:18px;margin-top:10px">${esc(t.name)}</div>
<div style="color:#444;font-size:13px">${esc(tier.name)} · ${naira(t.amount)}</div>
<div style="color:#444;font-size:13px;font-family:monospace;margin-top:4px">${esc(t.id)}</div></div>
<p style="font-size:14px;line-height:1.6;margin:18px 0 6px"><b>${esc(EVENT.dateLabel)}</b> · ${esc(EVENT.timeLabel)}<br>${esc(EVENT.venue)}</p>
<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#3eb5ca;color:#062a44;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">Open my ticket</a>
&nbsp;<a href="${EVENT.mapsUrl}" style="color:#9fe3ef;font-size:14px">Get directions</a></p>
<p style="font-size:12px;opacity:.65;margin:20px 0 0">Questions? WhatsApp +${EVENT.whatsapp} or reply to this email.<br>You received this because a ticket for ${esc(EVENT.name)} ${EVENT.year} was bought with this address. Ticket ${esc(t.id)}.</p>
</td></tr></table></body></html>`;

  const text = `Hi ${t.name.split(" ")[0]}, you're in.

Your ticket for ${EVENT.name} ${EVENT.year}
${t.name} - ${tier.name}
Ticket ID: ${t.id}
Open your ticket: ${link}

${EVENT.dateLabel}, ${EVENT.timeLabel}
${EVENT.venue}
Directions: ${EVENT.mapsUrl}

Show the QR code at the entrance.

Questions? WhatsApp +${EVENT.whatsapp} or reply to this email.`;

  await sendWithRetry(
    {
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: [t.email],
      reply_to: EVENT.supportEmail,
      subject: `Your ${EVENT.name} ${EVENT.year} ticket (${t.id})`,
      html,
      text,
    },
    // Same key = Resend sends it only once, so webhook + success page retries can't double-email.
    // A manual resend passes its own key so it always goes out.
    opts.idempotencyKey || `ticket-${t.id}`
  );
}

// Uses the Academy's verified Resend address; only the display name changes.
const DEFAULT_FROM = "Hacksat Connect <noreply@academy.hacksatech.com>";

// Retries rate limits and Resend/network hiccups. Bad key, bad address etc. fail at once.
async function sendWithRetry(body, key, tries = 3) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  let last;
  for (let i = 0; i < tries; i++) {
    if (i) await new Promise((r) => setTimeout(r, 800 * 2 ** (i - 1)));
    let res;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify(body),
      });
    } catch (e) {
      last = new Error("Could not reach Resend: " + e.message);
      continue;
    }
    if (res.ok) return;
    const msg = await res.text().catch(() => "");
    let detail = msg;
    try { detail = JSON.parse(msg).message || msg; } catch {}
    last = new Error(`Resend ${res.status}: ${detail}`.slice(0, 300));
    if (res.status !== 429 && res.status < 500) break; // won't fix itself
  }
  throw last;
}
