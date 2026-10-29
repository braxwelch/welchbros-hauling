/**
 * Welch Bros Hauling — receiver for the website and the crew quote tool.
 *
 * Paste this into a Google Sheet:
 *   Extensions → Apps Script → (replace everything) → paste → Save.
 * Then deploy it as a Web App (see SETUP.md) and put the URL in
 * BOOKING_ENDPOINT in config.js.
 *
 * Three kinds of requests come in, each to its own tab (created the first time):
 *   booking     → "Bookings"        (fixed-price bookings from the website)
 *   quote       → "Quote Requests"  (website quote requests; photos saved to Drive)
 *   crew_quote  → "Crew Quotes"     (on-site quotes from crew.html; needs CREW_PIN)
 */

var ALERT_EMAIL = '';        // e.g. the business Gmail; leave blank to skip alerts
var CREW_PIN = '';           // REQUIRED for crew logging: pick a PIN, tell the crew
var PHOTO_FOLDER = 'Welch Bros Quote Photos';   // Drive folder, created if missing
var MAX_PHOTOS = 6;

var TABS = {
  booking: ['Bookings',
    ['Logged At', 'Status', 'Name', 'Phone', 'Email', 'Load', 'Extras', 'Estimate',
     'Date', 'Window', 'Address', 'City', 'Items', 'Heard From']],
  quote: ['Quote Requests',
    ['Logged At', 'Status', 'Name', 'Phone', 'Email', 'Send Quote By', 'Items', 'Where',
     'Address', 'City', 'How Soon', 'Photos', 'Quoted $', 'Quoted By']],
  crew_quote: ['Crew Quotes',
    ['Logged At', 'Status', 'Crew', 'Name', 'Phone', 'Address', 'Load', 'Extras',
     'Total', 'Notes']]
};

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var type = d.type || 'booking';
    if (!TABS[type]) return json({ result: 'error', error: 'unknown type' });

    if (type === 'booking') {
      append_(type, [new Date(), 'New', d.name, d.phone, d.email, d.load, d.extras,
                     d.estimate, d.date, d.window, d.address, d.city, d.items, d.source]);
      alert_('New booking: ' + d.name + ' · ' + d.date + ' ' + d.window,
             [d.name, d.phone, d.load + (d.extras ? ' + ' + d.extras : ''),
              'Estimate $' + d.estimate, d.date + ' ' + d.window, d.address + ', ' + d.city, d.items]);
    }

    if (type === 'quote') {
      var links = savePhotos_(d.photos || [], d.name);
      append_(type, [new Date(), 'New', d.name, d.phone, d.email, d.contact, d.items, d.where,
                     d.address, d.city, d.when, links.join('\n'), '', '']);
      alert_('Quote request: ' + d.name + ' · ' + d.city + ' · ' + links.length + ' photo(s)',
             [d.name, d.phone + ' (send by ' + d.contact + ')', d.items, d.where,
              d.address + ', ' + d.city, 'How soon: ' + d.when].concat(links));
    }

    if (type === 'crew_quote') {
      if (!CREW_PIN || String(d.pin) !== String(CREW_PIN)) return json({ result: 'error', error: 'wrong PIN' });
      logCrewQuote_(d);
    }
    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

// "They said yes / passed" updates today's "Quoted" row for the same customer
// instead of adding a second row; otherwise it appends a new one.
function logCrewQuote_(d) {
  var sheet = tab_('crew_quote');
  if (d.status !== 'Quoted' && d.phone) {
    var rows = sheet.getDataRange().getValues();
    var today = new Date().toDateString();
    for (var i = rows.length - 1; i >= 1; i--) {
      if (rows[i][1] === 'Quoted' && String(rows[i][4]) === String(d.phone) &&
          new Date(rows[i][0]).toDateString() === today) {
        sheet.getRange(i + 1, 2).setValue(d.status);
        sheet.getRange(i + 1, 9).setValue(d.total);
        return;
      }
    }
  }
  sheet.appendRow([new Date(), d.status, d.crew, d.name, d.phone, d.address, d.load,
                   d.extras, d.total, d.notes]);
}

function savePhotos_(photos, name) {
  if (!photos.length) return [];
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  return photos.slice(0, MAX_PHOTOS).map(function (p, i) {
    var m = String(p.data).match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
    if (!m) return '';
    var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1],
                                 stamp + ' ' + (name || 'quote') + ' ' + (i + 1) + '.jpg');
    return folder.createFile(blob).getUrl();
  }).filter(String);
}

function tab_(type) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = TABS[type][0], headers = TABS[type][1];
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function append_(type, row) {
  tab_(type).appendRow(row.map(function (v) { return v === undefined || v === null ? '' : v; }));
}

function alert_(subject, lines) {
  if (ALERT_EMAIL) MailApp.sendEmail(ALERT_EMAIL, subject, lines.filter(String).join('\n'));
}

// A GET in a browser just confirms the script is live.
function doGet() {
  return json({ status: 'ok', message: 'Welch Bros endpoint is live.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
