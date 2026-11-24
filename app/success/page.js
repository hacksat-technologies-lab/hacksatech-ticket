import { redirect } from "next/navigation";
import { issueTicket, siteUrl } from "@/lib/tickets";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirming payment", robots: "noindex" };

export default async function Success({ searchParams }) {
  const { reference } = await searchParams;
  if (!reference) redirect("/");

  let ticket = null;
  try {
    // issueTicket returns the existing ticket if the webhook already saved it, otherwise
    // verifies with Paystack and saves it now. The Sheet script dedupes, so no waiting needed.
    const h = await headers();
    const origin = process.env.SITE_URL || `https://${h.get("host")}`;
    ticket = await issueTicket(reference, origin.startsWith("http") ? origin : siteUrl());
  } catch (e) {
    console.error(e);
  }
  if (ticket) redirect(`/t/${ticket.id}`);

  return (
    <main className="wrap center">
      <div className="glass card pad" style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 className="h2">Payment received?</h1>
        <p className="muted">
          We are still confirming your payment. It is safe to leave this page. Your ticket will be emailed to you
          as soon as it is confirmed.
        </p>
        <a className="btn" href={`/success?reference=${encodeURIComponent(reference)}`}>Check again</a>
      </div>
    </main>
  );
}
