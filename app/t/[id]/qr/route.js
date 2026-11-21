import QRCode from "qrcode";

export async function GET(req, { params }) {
  const { id } = await params;
  const url = `${new URL(req.url).origin}/t/${encodeURIComponent(id)}`;
  const png = await QRCode.toBuffer(url, { margin: 1, width: 480, errorCorrectionLevel: "M" });
  return new Response(png, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
