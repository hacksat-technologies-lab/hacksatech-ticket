# Hacksat Connect 2026 — Ticketing Platform: Investigation & Plan

Event: **Hacksat Connect 2026**, 12 Dec 2026, Yola, Adamawa. Today is 21 Nov, so about 3 weeks. Scope has to stay small.

## 1. What I found

**Hacksat Tech Ltd** (hacksatech.com): Yola-based ICT company. Training, bootcamps, software, branding, events, ambassador programs. Tone is aspirational and community-driven ("Innovating Technology Across Africa"). 47 past events listed; Hacksat Connect is not listed on the site yet. Socials: @hacksatechltd on X, IG, FB, YT, Threads, LinkedIn. WhatsApp 08100448196.

**Academy** (academy.hacksatech.com): Next.js app, already uses **Paystack**, mobile-first, copy is plain and reassuring ("you can safely leave the checkout page while you wait"). Good tone reference for our UX copy.

**Brand colors** (from raw HTML/CSS and the printed tickets):
| Role | Value | Source |
|---|---|---|
| Primary teal | `#3EB5CA` | site theme-color |
| Deep navy | `#062A44` | site CSS |
| Violet | `#5B21B6` / `#EDE9FE` | site CSS |
| Gold accent | `#C9A34A` / `#F5D68A` | site CSS |
| Ticket blue / indigo / teal | approx. sky blue, deep indigo, aqua-teal | printed tickets: 2K = blue, 3K = indigo, 10K = teal |

Fonts: Poppins on the main site. Academy uses a custom heading font. Proposal: **Poppins** for headings and UI text (matches brand, one family, subset it).

**Printed tickets**: three tiers with their own color, with bank details (UBA 1027596811, Hacksat Tech Ltd) and phones 08100448196 / 07044457972. Note the High School tier is misspelled "Studets" on the print. Worth fixing in any reprint. The digital ticket should echo these three colors so physical and digital feel like one family.

**Inspiration images**: (1) the Nike "Art of Victory" wallet-style ticket: a big bold card with a QR code in the middle, holder name and email at the bottom, with glass action buttons underneath. This is the model for our digital ticket. (2) Profile cards on dark with frosted glass overlay: shows glass layering over imagery. (3) The Russian tour landing page: full-bleed hero photo, frosted glass panel with nav and headline, glass cards with a CTA each. This is the model for our landing page, and the three tier cards map directly to the three glass cards.

## 2. Product scope (v1)

1. **Landing page**: hero (event name, date, venue), three glass tier cards, short "what to expect", FAQ, WhatsApp help.
2. **Checkout**: pick tier, then a 1-screen form: name, phone, email, plus *school name* only for High School. Then Paystack popup.
3. **Confirmation page**: shows the ticket right away (QR, name, tier), "Add to home screen / Save image" button.
4. **Email**: ticket emailed immediately after payment, with the QR inline and a link to the ticket page.
5. **Door check-in** (small but valuable): a `/scan` page for staff, behind a PIN, that scans the QR and marks it used. Catches duplicates and screenshots shared around.
6. **Offline/cash sales**: staff add a row in Google Sheets (or an `/admin` form) and the system issues the same ticket and email.

Out of scope for v1: accounts/login, refunds UI, seat maps, discount codes (cheap to add later).

## 3. Architecture

- **Frontend + API**: one **Next.js (App Router)** project on Vercel, or Astro with serverless functions if we want the lightest page. Recommendation: **Next.js**, because the Academy is already Next.js, so the team can maintain it. Keep JS tiny: only the checkout form and scanner are client components.
- **Styling**: plain CSS with variables (no UI library). Liquid-glass is built from `backdrop-filter` + layered gradients + specular border highlights. About 3 KB of CSS.
- **Payments**: Paystack inline popup, amount set **server-side** from the tier (never trust the client). Flow: server `initialize` call returns a reference, client opens the popup, **webhook** (`charge.success`, signature verified) is the source of truth that creates the ticket. The success page also verifies by reference as a fallback.
- **Database**: **Google Sheets** via a service account. Tabs: `Tickets` (id, reference, tier, name, phone, email, school, amount, channel online/cash/transfer, status, checked_in_at, created_at), `Config` (event name, date, venue, tiers and prices, sale open/closed). Because tiers and event details live in `Config`, repurposing for another event is mostly editing a sheet.
  - Caveats: Sheets API is rate-limited (about 60 writes per minute per user), which is fine for this volume. We append rows atomically and make writes idempotent by Paystack reference, so a webhook retry never double-issues.
- **Email**: **Resend** (free tier 3,000/month, 100/day. Check the daily cap against expected peak sales) or Brevo (300/day free). Needs a verified sending domain (SPF/DKIM on hacksatech.com) so mail lands in the inbox and not spam. Decision needed, see below.
- **Ticket ID and QR**: short random ID (e.g. `HC26-7K4P9X`) plus an HMAC signature, QR encodes a URL like `/t/<id>`. QR rendered server-side as inline SVG or PNG. Ticket page is the single source of truth.
- **Ticket image**: generated with `@vercel/og` (Satori) in the printed-ticket colors, so it can be saved or shared from the phone.
- **Config/secrets**: all in Vercel env vars (Paystack secret, Sheets service account, Resend key, signing secret).

## 4. UX and design direction

- **Mobile first**, one-thumb layout, bottom-anchored primary button, large tap targets (48px+), numeric keypad for phone, `autocomplete` attributes so forms autofill.
- **Liquid glass**: translucent frosted surfaces over a rich background (brand teal/indigo mesh gradient or event photography), refractive highlight edge, soft depth, springy micro-interactions. Respect `prefers-reduced-motion` and `prefers-reduced-transparency`, and keep text contrast at AA by tinting the glass behind text.
- **Fast on cheap phones and slow networks** (important in this market): target under 100 KB of JS, system-friendly fonts or a single subsetted Poppins, no big video, hero image served as AVIF/WebP, `backdrop-filter` limited to a few layers and a solid fallback when unsupported.
- **Flow**: Tier card tap goes to a bottom-sheet form (no page jump) then Paystack then a ticket reveal animation. Total of about 3 taps plus typing.
- **Trust cues**: "Pay securely with Paystack", "Ticket arrives by email instantly", WhatsApp help button, safe-to-close message like the Academy's.
- **Light/dark**: dark glass default (matches inspiration), light variant optional.

## 5. Repurposing and maintenance

- Event details, tiers, prices, and extra fields come from the `Config` sheet. Tier colors and copy are config too.
- A single `event.config` file holds the theme tokens, so a new event means a new config + hero image, not a code change.
- No ORM, no server, no build-time dependencies beyond Next.js, a Sheets client, and a QR library. Small enough for one person to understand.

## 6. Risks and how we handle them

| Risk | Mitigation |
|---|---|
| Webhook missed or delayed | Success page verifies by reference; a "resend my ticket" form by email/phone |
| Duplicate tickets on retry | Idempotent on Paystack reference |
| Sheets quota or slowness during a sales spike | Retry with backoff; sales volume is low. Can swap to a real DB later behind one `store` module |
| Emails landing in spam | Verified domain, plain-text part, ticket link in body, plus the on-site ticket page |
| Fake/shared screenshot tickets | Signed IDs, check-in marks a ticket used once |
| Paystack fees (about 1.5% + ₦100 over ₦2,500) | Decide who absorbs it. 2K tickets are under ₦2,500 so no flat fee. Can add fees on top or absorb |
| Glass effect heavy on low-end phones | Few layers, solid fallback, reduced-transparency support |
| Cash and bank-transfer sales not matching online | One Sheet is the ledger; `channel` column distinguishes them |

## 7. Milestones

1. Scaffold, design tokens, liquid-glass components, landing page (mobile first).
2. Checkout form, Paystack (test mode), webhook, Sheets write.
3. Ticket page, QR, ticket image, email delivery.
4. Check-in scanner, manual/cash issuing, resend-ticket.
5. Polish, accessibility, performance pass, Vercel deploy on a temporary domain, test-mode dry run with real phones, then switch to live keys.

## 8. Decisions needed from you

1. Email provider and domain: can we verify a sending domain on hacksatech.com (needs DNS access), e.g. `tickets@hacksatech.com`? Otherwise a temporary sender, with a higher spam risk.
2. Paystack: do you have a live business account and its keys, or are we starting in test mode?
3. Who pays the Paystack fee: absorbed or added at checkout?
4. Venue name and time of the event, plus any hero photography or past event photos to use.
5. Is a QR check-in scanner wanted for the day, or just the emailed ticket?
6. Cash sales: should staff add rows directly in the Sheet (we email on a "send" action), or use a small `/admin` form? I recommend the form with a PIN.
7. Reprint: fix "Studets" on the High School ticket. Should the digital version say "High School Student"?
