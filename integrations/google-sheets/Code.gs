const SPREADSHEET_ID = '15lyPD8bEm7tNALKFM-JrRVyj8V9nbTX-2RLo7uxvUC0';
const REGISTRATIONS_SHEET = 'Registrations';
const FEEDBACK_SHEET = 'Feedback';

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const action = String(event.parameter.action || 'registration').trim().toLowerCase();
    if (action === 'feedback') {
      return saveFeedback(event.parameter);
    }

    const email = String(event.parameter.email || '').trim().toLowerCase();
    const source = String(event.parameter.source || 'starter-pack').slice(0, 100);
    const consent = String(event.parameter.consent || '') === 'true';
    const accessMode = String(event.parameter.accessMode || 'free-phase-1').slice(0, 50);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !consent) {
      return jsonResponse({ ok: false, error: 'A valid email and consent are required.' });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(REGISTRATIONS_SHEET);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(REGISTRATIONS_SHEET);
      sheet.appendRow(['Email', 'Registered At', 'Source', 'Consent', 'Access Mode']);
      sheet.setFrozenRows(1);
    }

    const lastRow = sheet.getLastRow();
    const existingEmails = lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat().map(value => String(value).trim().toLowerCase())
      : [];
    const existingIndex = existingEmails.indexOf(email);

    if (existingIndex === -1) {
      sheet.appendRow([email, new Date(), source, true, accessMode]);
      return jsonResponse({ ok: true, created: true });
    }

    return jsonResponse({ ok: true, created: false });
  } finally {
    lock.releaseLock();
  }
}

function saveFeedback(parameters) {
  const category = safeText(parameters.category || 'general', 50);
  const message = safeText(parameters.message || '', 2000);
  const email = String(parameters.email || '').trim().toLowerCase();
  const source = safeText(parameters.source || 'feedback-page', 100);
  const pagePath = safeText(parameters.pagePath || '/feedback', 200);
  const consent = String(parameters.consent || '') === 'true';

  if (message.length < 10 || !consent) {
    return jsonResponse({ ok: false, error: 'A message of at least 10 characters and consent are required.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ ok: false, error: 'The optional email address is invalid.' });
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(FEEDBACK_SHEET);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(FEEDBACK_SHEET);
    sheet.appendRow(['Submitted At', 'Category', 'Message', 'Email', 'Source', 'Page Path']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#07111f').setFontColor('#ffffff');
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 500);
    sheet.setColumnWidth(4, 240);
    sheet.setColumnWidth(5, 190);
    sheet.setColumnWidth(6, 160);
  }

  sheet.appendRow([new Date(), category, message, safeText(email, 254), source, pagePath]);
  sheet.getRange(sheet.getLastRow(), 3).setWrap(true);
  return jsonResponse({ ok: true, created: true, type: 'feedback' });
}

function safeText(value, maxLength) {
  const text = String(value || '').trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doGet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return jsonResponse({
    ok: true,
    service: 'Sofinora registration collector',
    spreadsheetId: spreadsheet.getId(),
    sheets: spreadsheet.getSheets().map(sheet => sheet.getName()),
    capabilities: ['registration', 'feedback'],
  });
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
