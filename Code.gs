/**
 * Welch Bros Hauling — booking receiver.
 *
 * Paste this into a Google Sheet:
 *   Extensions → Apps Script → (replace everything) → paste → Save.
 * Then deploy it as a Web App (see SETUP.md) and put the URL in
 * BOOKING_ENDPOINT at the top of index.html's script.
 *
 * Each online booking becomes a new row on a "Bookings" tab (created the
 * first time), and an email alert goes to ALERT_EMAIL so nobody has to
 * watch the sheet.
 */

var SHEET_NAME = 'Bookings';
var ALERT_EMAIL = '';   // e.g. the business Gmail; leave blank to skip alerts
var HEADERS = ['Logged At', 'Status', 'Name', 'Phone', 'Email', 'Load', 'Extras',
               'Estimate', 'Date', 'Window', 'Address', 'City', 'Items', 'Heard From'];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(), 'New',
      d.name || '', d.phone || '', d.email || '',
      d.load || '', d.extras || '', d.estimate || '',
      d.date || '', d.window || '',
      d.address || '', d.city || '', d.items || '', d.source || ''
    ]);
    if (ALERT_EMAIL) {
      MailApp.sendEmail(ALERT_EMAIL,
        'New booking: ' + (d.name || '?') + ' · ' + (d.date || '') + ' ' + (d.window || ''),
        [d.name, d.phone, d.load + (d.extras ? ' + ' + d.extras : ''),
         'Estimate $' + d.estimate, d.date + ' ' + d.window,
         d.address + ', ' + d.city, d.items].join('\n'));
    }
    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

// A GET in a browser just confirms the script is live.
function doGet() {
  return json({ status: 'ok', message: 'Welch Bros booking endpoint is live.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
