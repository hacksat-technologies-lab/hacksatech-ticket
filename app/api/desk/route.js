import crypto from "node:crypto";
import { getTier } from "@/lib/event";
import { issueCashTicket, siteUrl } from "@/lib/tickets";

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
    return Response.json({ id: t.id, name: t.name, tier: tier.name, phone: t.phone, emailed: t.emailed === "yes", url: `${siteUrl(req)}/t/${t.id}` });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not save the ticket. Check the Sheet connection and try again." }, { status: 502 });
  }
}
