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
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Google returns an HTML page when the deployment is wrong (sign-in page, script error, old version)
    const body = text.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || text;
    const hint = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    data = { error: `non-JSON response (${res.status}) from Apps Script: ${hint}` };
  }
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

// The calls below need the updated Apps Script (search / pending / update actions).
const demo = () => process.env.NODE_ENV === "development" && !process.env.SHEET_SCRIPT_URL;

export async function searchTickets(q) {
  if (demo()) {
    const t = await findTicket("id", "DEMO-REGULAR");
    return /demo|amina|08100000000/i.test(q) ? [t] : [];
  }
  return (await rpc("search", { q })).tickets || [];
}

// { tickets: first 50 with an undelivered email, total }
export async function pendingEmails() {
  if (demo()) return { tickets: [], total: 0 };
  return rpc("pending");
}

export async function setTicketFields(id, fields) {
  if (demo()) return { ok: true };
  return rpc("update", { id, fields });
}
