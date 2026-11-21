import type { Metadata } from "next";
import "@ui-sdk/core/web.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRShield — Sovereign Dynamic QR & Anti-Ransom Campaign Studio",
  description:
    "Self-hosted, open-source dynamic QR code studio with editable redirect destinations, custom gradients and shapes, high-res SVG export, and privacy-first scan analytics. Zero SaaS hostage subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060910] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
