# Hacksat Connect ticketing

Next.js app. Event details, tiers and prices: `lib/event.js` (edit this to reuse for another event).

## Setup
1. Copy `.env.example` to `.env.local` and fill it in (Paystack test key first).
2. Google Sheet with a tab named **Tickets** and this header row (A1:L1):
   `id | reference | tier | name | phone | email | school | amount | channel | status | emailed | created_at`
   Share the sheet (Editor) with the service account email.
3. Paystack dashboard: set the webhook URL to `https://<your-domain>/api/webhook`.
4. `npm run dev`, then deploy to Vercel and add the same env vars there.

## Offline / cash sales
Add a row by hand: any unique `id` (e.g. `HC26-CASH01`), `tier` (student / regular / premium), name, email, `amount`,
`channel` = cash, `status` = valid. The ticket opens at `/t/<id>` and the QR is `/t/<id>/qr`.
At the door staff open the scanned link or search the Sheet. Set `status` to `used` to flag a ticket as used.
