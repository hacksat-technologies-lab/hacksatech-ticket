import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { findTicket } from "@/lib/sheets";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { EVENT, getTier } from "@/lib/event";

let fonts;
const loadFonts = async () =>
  (fonts ||= await Promise.all(
    [["Regular", 400], ["Bold", 700], ["ExtraBold", 800]].map(async ([w, weight]) => ({
      name: "Poppins",
      weight,
      style: "normal",
      data: await readFile(path.join(process.cwd(), "assets/fonts", `Poppins-${w}.ttf`)),
    }))
  ));
let logo;
const loadLogo = async () =>
  (logo ||= "data:image/png;base64," + (await readFile(path.join(process.cwd(), "assets/brand/logo-white.png"))).toString("base64"));
// Image fonts have no ₦ glyph, so the image spells out the currency.
const ngn = (n) => "NGN " + Number(n).toLocaleString("en-NG");

// Ticket + receipt as a PNG the buyer can save to their phone.
export async function GET(req, { params }) {
  const { id } = await params;
  const t = await findTicket("id", decodeURIComponent(id)).catch(() => null);
  if (!t) return new Response("Not found", { status: 404 });

  const tier = getTier(t.tier) || { name: t.tier, color: "#3eb5ca" };
  const origin = new URL(req.url).origin;
  const qr = await QRCode.toDataURL(`${origin}/t/${t.id}`, { margin: 1, width: 560, errorCorrectionLevel: "M" });
  const paid = t.created_at ? new Date(t.created_at) : null;
  const paidLabel = paid && !isNaN(paid) ? paid.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }) : "";
  const channel = t.channel === "online" ? "Paystack" : t.channel || "";

  const k = { fontSize: 22, letterSpacing: 3, color: "#7a8a96", textTransform: "uppercase" };
  const v = { fontSize: 32, fontWeight: 700, color: "#062a44", marginTop: 4 };
  const row = { display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "2px solid #eef2f5" };

  const img = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0a3d63 0%, #062a44 55%, #2a1a6e 100%)", fontFamily: "Poppins" }}>
        <div style={{ width: 920, display: "flex", flexDirection: "column", borderRadius: 36, overflow: "hidden", background: "#fff" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: "48px 56px", color: "#fff", background: `linear-gradient(150deg, ${tier.color}, #062a44)` }}>
            <img src={await loadLogo()} width={88} height={80} />
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 6 }}>{`${EVENT.name} ${EVENT.year}`}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 22, fontSize: 26 }}>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.2)", padding: "6px 20px", borderRadius: 36 }}>{EVENT.dateLabel}</div>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.2)", padding: "6px 20px", borderRadius: 36 }}>{EVENT.timeLabel}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0 24px", borderBottom: "4px dashed #cfd9e0" }}>
            <img src={qr} width={420} height={420} />
            <div style={{ fontSize: 30, fontFamily: "monospace", letterSpacing: 4, color: "#31566f", marginTop: 16 }}>{t.id}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "32px 56px 44px" }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#062a44" }}>{t.name}</div>
            <div style={{ fontSize: 26, color: "#5b6b77", marginTop: 4 }}>{t.email}</div>
            {t.school ? <div style={{ fontSize: 26, color: "#5b6b77", marginTop: 4 }}>{t.school}</div> : null}

            <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
              <div style={row}><div style={k}>Ticket</div><div style={{ ...v, marginTop: 0, fontSize: 28 }}>{tier.name}</div></div>
              <div style={row}><div style={k}>Amount paid</div><div style={{ ...v, marginTop: 0, fontSize: 28 }}>{ngn(t.amount)}</div></div>
              {paidLabel ? <div style={row}><div style={k}>Paid on</div><div style={{ ...v, marginTop: 0, fontSize: 28 }}>{paidLabel}</div></div> : null}
              {channel ? <div style={row}><div style={k}>Method</div><div style={{ ...v, marginTop: 0, fontSize: 28 }}>{channel}</div></div> : null}
              <div style={{ ...row, borderBottom: "none" }}><div style={k}>Reference</div><div style={{ ...v, marginTop: 0, fontSize: 24, fontFamily: "monospace" }}>{t.reference}</div></div>
            </div>

            <div style={{ fontSize: 24, color: "#5b6b77", marginTop: 20, lineHeight: 1.4 }}>{EVENT.venue}</div>
            <div style={{ fontSize: 22, color: "#7a8a96", marginTop: 10 }}>Show this QR code at the entrance · Hacksat Tech Ltd</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await loadFonts() }
  );

  const headers = new Headers(img.headers);
  headers.set("Cache-Control", "private, no-store");
  if (new URL(req.url).searchParams.has("download")) {
    headers.set("Content-Disposition", `attachment; filename="hacksat-connect-${t.id}.png"`);
  }
  return new Response(img.body, { status: 200, headers });
}
