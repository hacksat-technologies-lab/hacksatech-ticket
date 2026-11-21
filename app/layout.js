import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const metadata = {
  title: "Hacksat Connect 2026 — Get your ticket",
  description: "Connect. Collaborate. Create. 12 December 2026, Yola, Adamawa State. Get your ticket in under a minute.",
  openGraph: { title: "Hacksat Connect 2026", description: "12 December 2026 · Yola, Adamawa State" },
};
export const viewport = { themeColor: "#062a44", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <div className="bg" aria-hidden="true"><i /><i /><i /></div>
        {children}
      </body>
    </html>
  );
}
