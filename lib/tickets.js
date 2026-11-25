import crypto from "node:crypto";
import { EVENT, getTier } from "./event.js";
import { findTicket, addTicket, markEmailed, setTicketFields } from "./sheets.js";
import { sendTicketEmail } from "./email.js";

export { siteUrl } from "./site.js";

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

  await deliverTicket(ticket, origin);
  return ticket;
}

// Cash sales from the /desk page. Each call is a new sale, so the reference is random.
export async function issueCashTicket({ tier, name, phone, email, school, amount }, origin) {
  const reference = "CASH-" + crypto.randomBytes(9).toString("base64url");
  const ticket = {
    id: ticketId(reference),
    reference,
    tier: tier.id,
    name,
    phone,
    email,
    school,
    amount,
    channel: "cash",
    status: "valid",
    emailed: "",
    created_at: new Date().toISOString(),
  };

  // Design preview only: no Sheet locally, so hand back a demo ticket instead of storing one
  if (process.env.NODE_ENV === "development" && !process.env.SHEET_SCRIPT_URL) {
    return { ...ticket, id: `DEMO-${tier.id.toUpperCase()}` };
  }

  await addTicket(ticket);
  if (email) await deliverTicket(ticket, origin);
  return ticket;
}

// Emails the ticket and writes the outcome to the "emailed" column: "yes", or "failed <date>: <reason>".
// Never throws: a failed email must not fail the payment webhook. Returns { ok, error }.
// resend=true is a deliberate repeat (desk resend / retry), so it gets a fresh idempotency key.
export async function deliverTicket(ticket, origin, { resend = false } = {}) {
  let ok = true, error = "";
  try {
    await sendTicketEmail(ticket, origin, resend ? { idempotencyKey: `ticket-${ticket.id}-${Date.now()}` } : {});
  } catch (e) {
    ok = false;
    error = e.message;
    console.error("email failed", ticket.id, e.message);
  }
  const emailed = ok ? "yes" : `failed ${new Date().toISOString().slice(0, 16).replace("T", " ")}: ${error}`.slice(0, 160);
  try {
    await setTicketFields(ticket.id, { emailed });
  } catch {
    if (ok) await markEmailed(ticket.id).catch(() => {}); // Sheet script not redeployed yet
  }
  ticket.emailed = emailed;
  return { ok, error };
}

export { EVENT };
