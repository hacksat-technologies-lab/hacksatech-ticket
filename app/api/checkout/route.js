import crypto from "node:crypto";
import { EVENT, getTier } from "@/lib/event";
import { siteUrl } from "@/lib/tickets";

const clean = (s, n = 120) => String(s ?? "").trim().replace(/\s+/g, " ").slice(0, n);

export async function POST(req) {
  if (!EVENT.salesOpen) return Response.json({ error: "Ticket sales are closed." }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const tier = getTier(b.tier);
  const name = clean(b.name);
  const phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
  const email = clean(b.email, 160).toLowerCase();
  const school = clean(b.school);

  if (!tier) return Response.json({ error: "Choose a ticket type." }, { status: 400 });
  if (name.length < 3) return Response.json({ error: "Enter your full name." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (tier.needsSchool && school.length < 2) return Response.json({ error: "Enter your school name." }, { status: 400 });

  const reference = "HC26-" + crypto.randomBytes(9).toString("base64url");
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: tier.price * 100, // price always comes from the server
      reference,
      callback_url: `${siteUrl(req)}/success`,
      metadata: { tier: tier.id, name, phone, email, school: tier.needsSchool ? school : "" },
    }),
  });
  const json = await res.json();
  if (!json?.status) return Response.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  return Response.json({ url: json.data.authorization_url });
}
