// Sheet storage via a small Google Apps Script web app bound to the Sheet (see apps-script/Code.gs).
// No Google Cloud project or service account needed.
// Tab "Tickets": id | reference | tier | name | phone | email | school | amount | channel | status | emailed | created_at

async function rpc(action, payload = {}) {
  const res = await fetch(process.env.SHEET_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS-style preflight on Apps Script
    body: JSON.stringify({ secret: process.env.SHEET_SCRIPT_SECRET, action, ...payload }),
    cache: "no-store",
    redirect: "follow",
  });
  const data = await res.json().catch(() => ({ error: `bad response (${res.status})` }));
  if (data.error) throw new Error("Sheet error: " + data.error);
  return data;
}

export async function findTicket(field, value) {
  // Design preview only: /t/DEMO-STUDENT etc. when running locally without a Sheet
  if (process.env.NODE_ENV === "development" && !process.env.SHEET_SCRIPT_URL && field === "id") {
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
  return (await rpc("find", { field, value })).ticket;
}

// Returns { ticket, created }. created=false means this payment reference already had a ticket.
export const addTicket = (ticket) => rpc("append", { ticket });

export const markEmailed = (id) => rpc("markEmailed", { id });
