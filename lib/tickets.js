import crypto from "node:crypto";
import { EVENT, getTier } from "./event.js";
import { findTicket, addTicket, markEmailed } from "./sheets.js";
import { sendTicketEmail } from "./email.js";

export const siteUrl = (req) =>
  process.env.SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (req ? new URL(req.url).origin : "http://localhost:3000");

// Deterministic ID from the payment reference: retries never create a second ticket.
export function ticketId(reference) {
  const h = crypto
    .createHmac("sha256", process.env.TICKET_SECRET || "dev-secret")
    .update(reference)
    .digest();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[h[i] % alphabet.length];
  return `HC26-${out}`;
}

export async function paystackVerify(reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    cache: "no-store",
  });
  const json = await res.json();
  return json?.status ? json.data : null;
}

// Called by both the webhook and the success page. Safe to call repeatedly.
export async function issueTicket(reference, origin) {
  const existing = await findTicket("reference", reference);
  if (existing) return existing;

  const tx = await paystackVerify(reference);
  if (!tx || tx.status !== "success") return null;

  const m = tx.metadata || {};
  const tier = getTier(m.tier);
  if (!tier || tx.amount < tier.price * 100) return null; // wrong amount: never issue

  const ticket = {
    id: ticketId(reference),
    reference,
    tier: tier.id,
    name: m.name,
    phone: m.phone,
    email: tx.customer?.email || m.email,
    school: m.school || "",
    amount: tx.amount / 100,
    channel: "online",
    status: "valid",
    emailed: "",
    created_at: new Date().toISOString(),
  };

  // The Sheet script appends under a lock and dedupes by reference, so webhook + success page can't double-issue.
  const { ticket: saved, created } = await addTicket(ticket);
  if (!created) return saved; // the other request already issued it and sent the email

  try {
    await sendTicketEmail(ticket, origin);
    await markEmailed(ticket.id);
    ticket.emailed = "yes";
  } catch (e) {
    console.error("email failed", e);
  }
  return ticket;
}

export { EVENT };
