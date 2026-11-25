import crypto from "node:crypto";
import { getTier } from "@/lib/event";
import { issueCashTicket, deliverTicket, siteUrl } from "@/lib/tickets";
import { findTicket, searchTickets, pendingEmails, setTicketFields } from "@/lib/sheets";

export const maxDuration = 60; // retrying a batch of emails can take a while

// Issues tickets for cash payments. Protected by DESK_PASSCODE (set it in .env / Vercel).
// If DESK_PASSCODE is not set, the desk is switched off.

const clean = (s, n = 120) => String(s ?? "").trim().replace(/\s+/g, " ").slice(0, n);

function passcodeOk(given) {
  const real = process.env.DESK_PASSCODE || "";
  if (real.length < 8) return false; // unset or too short: desk disabled
  const a = crypto.createHash("sha256").update(String(given || "")).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

const slow = () => new Promise((r) => setTimeout(r, 1200)); // makes guessing the passcode slow

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (!passcodeOk(req.headers.get("x-desk-passcode"))) {
    await slow();
    return Response.json({ error: "Wrong passcode." }, { status: 401 });
  }
  if (b.check) return Response.json({ ok: true }); // passcode check only
  if (b.action) {
    try {
      return await mailAction(b, req);
    } catch (e) {
      console.error(e);
      const old = /unknown action/.test(e.message);
      return Response.json({ error: old ? "The Google Sheet script is out of date. Paste the new apps-script/Code.gs and deploy a new version." : "Could not reach the Sheet. Try again." }, { status: 502 });
    }
  }

  const tier = getTier(b.tier);
  const name = clean(b.name);
  const phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
  const email = clean(b.email, 160).toLowerCase();
  const school = clean(b.school);
  const amount = Math.round(Number(b.amount));

  if (!tier) return Response.json({ error: "Choose a ticket type." }, { status: 400 });
  if (name.length < 3) return Response.json({ error: "Enter the buyer's full name." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "That email address doesn't look right." }, { status: 400 });
  if (tier.needsSchool && school.length < 2) return Response.json({ error: "Enter the school name." }, { status: 400 });
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return Response.json({ error: "Enter the amount received." }, { status: 400 });

  try {
    const t = await issueCashTicket(
      { tier, name, phone, email, school: tier.needsSchool ? school : "", amount },
      siteUrl(req)
    );
    return Response.json({ id: t.id, name: t.name, tier: tier.name, phone: t.phone, emailed: t.emailed === "yes", emailError: !!t.email && t.emailed !== "yes", url: `${siteUrl(req)}/t/${t.id}` });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not save the ticket. Check the Sheet connection and try again." }, { status: 502 });
  }
}

const brief = (t) => ({ id: t.id, name: t.name, email: t.email, phone: t.phone, tier: getTier(t.tier)?.short || t.tier, status: t.status, emailed: t.emailed || "" });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email delivery tools for the desk
async function mailAction(b, req) {
  const origin = siteUrl(req);

  if (b.action === "search") {
    const q = clean(b.q, 160);
    if (q.length < 3) return Response.json({ error: "Type a ticket ID, email or phone number." }, { status: 400 });
    return Response.json({ tickets: (await searchTickets(q)).map(brief) });
  }

  if (b.action === "pending") {
    const { tickets, total } = await pendingEmails();
    return Response.json({ tickets: tickets.map(brief), total });
  }

  if (b.action === "resend") {
    const t = await findTicket("id", clean(b.id, 40));
    if (!t) return Response.json({ error: "Ticket not found." }, { status: 404 });
    const email = clean(b.email, 160).toLowerCase() || t.email;
    if (!EMAIL_RE.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (email !== t.email) {
      await setTicketFields(t.id, { email }); // fix a mistyped address
      t.email = email;
    }
    const r = await deliverTicket(t, origin, { resend: true });
    return Response.json({ ...r, ticket: brief(t) });
  }

  // Retry every undelivered email, a few at a time to stay inside the request time limit
  if (b.action === "retryAll") {
    const { tickets, total } = await pendingEmails();
    const batch = tickets.slice(0, 10);
    let sent = 0;
    const failed = [];
    for (const t of batch) {
      const r = await deliverTicket(t, origin, { resend: true });
      if (r.ok) sent++;
      else failed.push({ id: t.id, name: t.name, error: r.error });
      if (!r.ok && /RESEND_API_KEY|401|403/.test(r.error)) break; // key problem: every one would fail
    }
    return Response.json({ sent, failed, remaining: Math.max(0, total - sent) });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
