/**
 * Hacksat tickets: Google Sheet bridge.
 * Paste into Extensions > Apps Script in the ticket Sheet, then:
 *   1. Project Settings > Script properties > add  SECRET = <long random string>
 *   2. Run setup() once (authorise when asked): creates the "Tickets" tab and header row
 *   3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone
 *      Copy the Web app URL into SHEET_SCRIPT_URL, and the SECRET into SHEET_SCRIPT_SECRET.
 * Requests without the right secret are rejected.
 * After pasting a newer copy of this file: Deploy > Manage deployments > edit (pencil) >
 * Version: New version > Deploy. The URL stays the same.
 */
const COLS = ["id", "reference", "tier", "name", "phone", "email", "school", "amount", "channel", "status", "emailed", "created_at"];

function setup() {
  const ss = SpreadsheetApp.getActive();
  const s = ss.getSheetByName("Tickets") || ss.insertSheet("Tickets");
  s.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight("bold");
  s.setFrozenRows(1);
  s.getRange(2, 1, s.getMaxRows() - 1, COLS.length).setNumberFormat("@"); // keep phone zeros, ISO dates as text
}

function sheet_() { return SpreadsheetApp.getActive().getSheetByName("Tickets"); }

function rows_() {
  const s = sheet_();
  const n = s.getLastRow() - 1;
  if (n < 1) return [];
  return s.getRange(2, 1, n, COLS.length).getValues().map(function (r) {
    const o = {};
    COLS.forEach(function (c, i) { o[c] = String(r[i] == null ? "" : r[i]); });
    return o;
  });
}

function norm_(v) { return String(v).trim().toLowerCase(); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: "bad request" }); }
  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || b.secret !== secret) return out_({ error: "unauthorized" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // one request at a time: no duplicate rows
  try {
    const rows = rows_();

    if (b.action === "find") {
      const hit = rows.filter(function (r) { return norm_(r[b.field]) === norm_(b.value); })[0];
      return out_({ ticket: hit || null });
    }

    if (b.action === "append") {
      const dup = rows.filter(function (r) { return norm_(r.reference) === norm_(b.ticket.reference); })[0];
      if (dup) return out_({ ticket: dup, created: false });
      const s = sheet_();
      const row = s.getLastRow() + 1;
      const rng = s.getRange(row, 1, 1, COLS.length);
      rng.setNumberFormat("@");
      rng.setValues([COLS.map(function (c) { return b.ticket[c] == null ? "" : String(b.ticket[c]); })]);
      return out_({ ticket: b.ticket, created: true });
    }

    if (b.action === "markEmailed") {
      const idx = rows.findIndex(function (r) { return norm_(r.id) === norm_(b.id); });
      if (idx >= 0) sheet_().getRange(idx + 2, COLS.indexOf("emailed") + 1).setValue("yes");
      return out_({ ok: true });
    }

    // Up to 10 tickets whose id, email or phone matches (used by the /desk resend tool)
    if (b.action === "search") {
      const q = norm_(b.q);
      const digits = String(b.q).replace(/\D/g, "");
      const hits = rows.filter(function (r) {
        return norm_(r.id) === q || norm_(r.email) === q ||
          (digits.length >= 10 && String(r.phone).replace(/\D/g, "").slice(-10) === digits.slice(-10));
      });
      return out_({ tickets: hits.slice(0, 10) });
    }

    // Tickets with an email address whose email has not been delivered yet
    if (b.action === "pending") {
      const list = rows.filter(function (r) { return r.email && r.status !== "void" && norm_(r.emailed) !== "yes"; });
      return out_({ tickets: list.slice(0, 50), total: list.length });
    }

    // Change the email address and/or delivery status of one ticket
    if (b.action === "update") {
      const idx = rows.findIndex(function (r) { return norm_(r.id) === norm_(b.id); });
      if (idx < 0) return out_({ error: "ticket not found" });
      ["email", "emailed"].forEach(function (f) {
        if (b.fields && b.fields[f] != null) sheet_().getRange(idx + 2, COLS.indexOf(f) + 1).setValue(String(b.fields[f]));
      });
      return out_({ ok: true });
    }

    return out_({ error: "unknown action" });
  } finally {
    lock.releaseLock();
  }
}
