# Welch Bros Hauling site — setup

## What this is
- `index.html` — the public site. The booking section has two modes:
  **Book at a set price** (load size + extras, live estimate, pick a date) and
  **Get a free quote** (photos + description, we send a price). Link straight to
  the quote form with `…/#quote`.
- `crew.html` — the on-site quote tool for the crew. Tap trailer fill, extras,
  heavy debris, coupon/adjustment; **Text quote** opens the phone's texting app
  with the price filled in; **They said yes / They passed** logs the result.
  Not linked from the site and hidden from Google, but the URL is public: logging
  needs the crew PIN.
- `config.js` — **the only place prices, the phone number, crew names and
  BOOKING_ENDPOINT live.** Both pages read it.
- `Code.gs` — Google Apps Script that writes everything into one Google Sheet:
  `Bookings`, `Quote Requests` (with links to photos saved in a Drive folder),
  and `Crew Quotes`.

## Preview mode (current)
`BOOKING_ENDPOINT` is empty, so both forms show their confirmation but save
nothing, and the crew tool doesn't log. Texting from the crew tool still works.
`PHONE` and `CREW` are placeholders.

## Before going live
1. In `config.js`: real business number in `PHONE`, real names in `CREW`.
2. Update `LOADS` / `ADDONS` / `HEAVY_PER_TON` once dump fees are confirmed
   (they mirror `Junk_Removal_Pricing_and_Costs.xlsx`).

## Connect to a Google Sheet (once)
1. Create a Google Sheet (e.g. "Welch Bros Jobs") in the business Google account.
2. **Extensions → Apps Script**, delete the default code, paste `Code.gs`.
   - Set `CREW_PIN` (any number the crew will remember).
   - Set `ALERT_EMAIL` to get an email for every booking and quote request.
   - **Save.**
3. **Deploy → New deployment** → type **Web app** → Execute as **Me**,
   access **Anyone** → **Deploy** → authorize (it asks for Sheets, Drive and
   Gmail — Drive is for the quote photos, Gmail for the alerts).
4. Copy the Web app URL (`https://script.google.com/macros/s/.../exec`) into
   `BOOKING_ENDPOINT` in `config.js`. Opening that URL in a browser should show
   `{"status":"ok",...}`.
5. On each crew phone: open `…/crew.html`, tap **Crew PIN**, enter the PIN,
   then **Add to Home Screen** so it opens like an app.

After any change to `Code.gs`: **Deploy → Manage deployments → edit → New
version**, or the live URL keeps running the old code.

## Working the sheet
- **Quote Requests:** open the photo links, decide a price (use `crew.html` to
  add it up), text the customer, then fill `Quoted $`, `Quoted By`, and set
  `Status` (New → Quoted → Won / Lost).
- **Crew Quotes:** "Text quote" logs a `Quoted` row; "They said yes / passed"
  flips that same row to `Won` / `Lost` (matched by customer phone, same day).
  Count Won ÷ all rows for your close rate.

## Hosting
GitHub Pages: https://braxwelch.github.io/welchbros-hauling/ (crew tool at
`/crew.html`). Point `welchbroshauling.com` at it later with a `CNAME` file.
