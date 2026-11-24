import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });

const base =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const share = { url: "/og.jpg", width: 1200, height: 630, alt: "Hacksat" };

export const metadata = {
  metadataBase: new URL(base),
  title: "Hacksat Connect 2026 — Get your ticket",
  description: "Connect. Collaborate. Create. 12 December 2026, Yola, Adamawa State. Get your ticket in under a minute.",
  openGraph: { type: "website", siteName: "Hacksat", title: "Hacksat Connect 2026", description: "12 December 2026 · Yola, Adamawa State. Get your ticket.", images: [share] },
  twitter: { card: "summary_large_image", site: "@Hacksatechltd", title: "Hacksat Connect 2026", description: "12 December 2026 · Yola, Adamawa State. Get your ticket.", images: [share.url] },
};
export const viewport = { themeColor: "#062a44", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <div className="bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
