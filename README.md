# Hacksat Connect ticketing

Next.js app. Event details, tiers and prices: `lib/event.js` (edit this to reuse for another event).

## Setup
1. Copy `.env.example` to `.env.local` and fill it in (Paystack test key first).
2. Google Sheet (no Google Cloud needed): create a Sheet, open Extensions > Apps Script, paste `apps-script/Code.gs`.
   Project Settings > Script properties: add `SECRET` (long random string). Run `setup()` once (creates the `Tickets` tab).
   Deploy > New deployment > Web app > Execute as *Me*, access *Anyone*. Put the Web app URL in `SHEET_SCRIPT_URL`
   and the same secret in `SHEET_SCRIPT_SECRET`. After editing the script, deploy a *new version*.
3. Paystack dashboard: set the webhook URL to `https://<your-domain>/api/webhook`.
4. `npm run dev`, then deploy to Vercel and add the same env vars there.

## Offline / cash sales
Add a row by hand: any unique `id` (e.g. `HC26-CASH01`), `tier` (student / regular / premium), name, email, `amount`,
`channel` = cash, `status` = valid. The ticket opens at `/t/<id>` and the QR is `/t/<id>/qr`.
At the door staff open the scanned link or search the Sheet. Set `status` to `used` to flag a ticket as used.
