import crypto from "node:crypto";

// Minimal Google Sheets client (service account, no dependencies).
// Tab "Tickets", columns A:L:
// id | reference | tier | name | phone | email | school | amount | channel | status | emailed | created_at
export const COLUMNS = [
  "id", "reference", "tier", "name", "phone", "email",
  "school", "amount", "channel", "status", "emailed", "created_at",
];

let cached = { token: null, exp: 0 };

const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

async function accessToken() {
  if (cached.token && Date.now() < cached.exp) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const sig = crypto.createSign("RSA-SHA256").update(`${head}.${claim}`).sign(key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claim}.${sig}`,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth failed: " + JSON.stringify(data));
  cached = { token: data.access_token, exp: Date.now() + 50 * 60 * 1000 };
  return cached.token;
}

const base = () => `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}`;

async function call(path, init = {}) {
  const res = await fetch(base() + path, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Sheets error: " + JSON.stringify(data));
  return data;
}

const rowToObj = (r) => Object.fromEntries(COLUMNS.map((c, i) => [c, r[i] ?? ""]));

export async function allTickets() {
  const data = await call("/values/Tickets!A2:L");
  return (data.values || []).map(rowToObj);
}

export async function findTicket(field, value) {
  // Design preview only: /t/DEMO-STUDENT etc. when running locally without a Sheet
  if (process.env.NODE_ENV === "development" && !process.env.SHEET_ID && field === "id") {
    const m = String(value).match(/^DEMO-(STUDENT|REGULAR|PREMIUM)$/i);
    if (m) {
      const tier = m[1].toLowerCase();
      return {
        id: `DEMO-${m[1].toUpperCase()}`, reference: "demo", tier, name: "Amina Yusuf", phone: "08100000000",
        email: "amina@example.com", school: tier === "student" ? "Government College Yola" : "",
        amount: { student: 2000, regular: 3000, premium: 10000 }[tier], channel: "online", status: "valid", emailed: "yes", created_at: "",
      };
    }
  }
  const v = String(value).trim().toLowerCase();
  const rows = await allTickets();
  return rows.find((r) => String(r[field]).trim().toLowerCase() === v) || null;
}

export async function addTicket(t) {
  const row = COLUMNS.map((c) => t[c] ?? "");
  await call("/values/Tickets!A:L:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS", {
    method: "POST",
    body: JSON.stringify({ values: [row] }),
  });
}

// Mark the emailed column for a ticket row (best effort)
export async function markEmailed(id) {
  const data = await call("/values/Tickets!A2:A");
  const idx = (data.values || []).findIndex((r) => r[0] === id);
  if (idx < 0) return;
  await call(`/values/Tickets!K${idx + 2}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [["yes"]] }),
  });
}
