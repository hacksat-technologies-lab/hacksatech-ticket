import { EVENT, getTier, naira } from "./event.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendTicketEmail(t, origin) {
  const tier = getTier(t.tier);
  const link = `${origin}/t/${t.id}`;
  const html = `<!doctype html><html><body style="margin:0;background:#062a44;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#0b3a5c;border-radius:2.5px;overflow:hidden;color:#fff">
<tr><td style="background:${tier.color};padding:22px 24px">
<div style="font-size:12px;letter-spacing:2px;opacity:.9">HACKSAT</div>
<div style="font-size:26px;font-weight:800;line-height:1.1">${esc(EVENT.name)} ${EVENT.year}</div>
<div style="font-size:13px;opacity:.95;margin-top:4px">${esc(EVENT.tagline)}</div></td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 4px;font-size:16px">Hi ${esc(t.name.split(" ")[0])}, you're in. 🎉</p>
<p style="margin:0 0 18px;font-size:14px;opacity:.85">Show this QR code at the entrance.</p>
<div style="background:#fff;border-radius:2.5px;padding:16px;text-align:center">
<img src="${origin}/t/${t.id}/qr" width="220" height="220" alt="Ticket QR code" style="display:block;margin:0 auto">
<div style="color:#062a44;font-weight:700;font-size:18px;margin-top:10px">${esc(t.name)}</div>
<div style="color:#444;font-size:13px">${esc(tier.name)} · ${naira(t.amount)}</div>
<div style="color:#444;font-size:13px;font-family:monospace;margin-top:4px">${esc(t.id)}</div></div>
<p style="font-size:14px;line-height:1.6;margin:18px 0 6px"><b>${esc(EVENT.dateLabel)}</b> · ${esc(EVENT.timeLabel)}<br>${esc(EVENT.venue)}</p>
<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#3eb5ca;color:#062a44;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:2.5px">Open my ticket</a>
&nbsp;<a href="${EVENT.mapsUrl}" style="color:#9fe3ef;font-size:14px">Get directions</a></p>
<p style="font-size:12px;opacity:.65;margin:20px 0 0">Questions? WhatsApp +${EVENT.whatsapp} or ${esc(EVENT.supportEmail)}.</p>
</td></tr></table></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [t.email],
      subject: `Your ticket: ${EVENT.name} ${EVENT.year}`,
      html,
      text: `Your ticket for ${EVENT.name} ${EVENT.year}\n${t.name} - ${tier.name}\nID: ${t.id}\nOpen: ${link}\n${EVENT.dateLabel}, ${EVENT.timeLabel}\n${EVENT.venue}`,
    }),
  });
  if (!res.ok) throw new Error("Resend: " + (await res.text()));
}
