import crypto from "node:crypto";
import { issueTicket, siteUrl } from "@/lib/tickets";

export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(raw).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return new Response("bad signature", { status: 401 });
  }
  const event = JSON.parse(raw);
  if (event.event === "charge.success") {
    try {
      await issueTicket(event.data.reference, siteUrl(req));
    } catch (e) {
      console.error(e);
      return new Response("retry", { status: 500 }); // Paystack will retry
    }
  }
  return new Response("ok");
}
