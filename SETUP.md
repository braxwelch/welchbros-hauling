# Welch Bros Hauling booking site — setup

## What this is
- `index.html` — the whole public site: services, pricing, about, and a booking
  form with a live estimate. Prices, add-ons, and the phone number live in the
  settings block at the top of the `<script>`; change them there.
- `Code.gs` — a Google Apps Script that logs each booking to a Google Sheet
  ("Bookings" tab) and optionally emails you an alert.

## Preview mode (current)
`BOOKING_ENDPOINT` is empty, so the form shows the confirmation but saves
nothing. Safe to share for feedback. `PHONE` is a placeholder.

## Before going live
1. Put the real business number in `PHONE`.
2. Update `LOADS` / `ADDONS` prices once dump fees are confirmed (they mirror
   `Junk_Removal_Pricing_and_Costs.xlsx`).

## Connect bookings to a sheet (once)
1. Create a Google Sheet (e.g. "Welch Bros Bookings") in the business Google account.
2. **Extensions → Apps Script**, delete the default code, paste `Code.gs`.
   Set `ALERT_EMAIL` if you want an email per booking. **Save.**
3. **Deploy → New deployment** → type **Web app** → Execute as **Me**,
   access **Anyone** → **Deploy** → authorize.
4. Copy the Web app URL (`https://script.google.com/macros/s/.../exec`) into
   `BOOKING_ENDPOINT`. Opening that URL in a browser should show
   `{"status":"ok",...}`.

## Hosting
Free on GitHub Pages (same as 334 Marine): push this folder to a repo, enable
Pages on `main`, then point `welchbroshauling.com` at it with a `CNAME` file.
