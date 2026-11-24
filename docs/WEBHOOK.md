# Paystack webhook: sharing with the Academy

Paystack allows **one webhook URL per mode** (one for Test, one for Live) on a business.
The Live URL is already `https://academy.hacksatech.com/api/webhooks/paystack` and stays as it is.

## What this means today (no change)

- The ticket site does **not** need a webhook to work. When a buyer returns from Paystack, the
  success page verifies the payment with Paystack and saves the ticket straight away.
- The only gap: a buyer who pays and then closes the tab **before** Paystack redirects back.
  Their money is taken but no ticket row is written until they reopen the link.
- The Academy webhook will also receive ticket payments (`charge.success`). Its handler must
  ignore payments it doesn't recognise and still reply **200**. Otherwise Paystack keeps
  retrying them for up to 72 hours. Ticket payments are tagged `metadata.source = "hacksat-ticket"`
  and use references starting with `HC26-`.

## Recommended: Academy forwards ticket events (closes the gap)

Add this near the top of the Academy's Paystack webhook handler, **after** it verifies the
signature. It forwards the original body and signature unchanged. Both sites use the same
Paystack secret key, so the ticket site's own signature check still passes.

```js
// academy: app/api/webhooks/paystack/route.(js|ts)
const raw = await req.text();               // the handler already reads the raw body for the signature
const event = JSON.parse(raw);
const isTicket =
  event?.data?.metadata?.source === "hacksat-ticket" ||
  String(event?.data?.reference || "").startsWith("HC26-");

if (isTicket) {
  if (process.env.TICKETS_WEBHOOK_URL) {
    await fetch(process.env.TICKETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": req.headers.get("x-paystack-signature") ?? "",
      },
      body: raw,
    }).catch((e) => console.error("ticket forward failed", e));
  }
  return new Response("ok", { status: 200 }); // never let Academy logic touch ticket payments
}
// ...existing Academy handling continues here
```

Academy env var (Vercel):

```
TICKETS_WEBHOOK_URL=https://<ticket-site-domain>/api/webhook
```

Notes:
- If the forward fails, nothing breaks: the success page still issues the ticket when the buyer returns.
- The ticket site saves each payment reference once, so a forwarded event plus the
  success page never produce two tickets or two emails.

## Test mode

If the Academy is **not** using the Test-mode webhook slot, set the ticket site's URL directly
in Paystack → Settings → API Keys & Webhooks → **Test Webhook URL**:
`https://<ticket-site-domain>/api/webhook`. This needs the site deployed, since Paystack can't reach localhost.
