import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRShield — Permanent QR Codes & Campaign Manager",
  description:
    "Generate custom, branded QR codes with dynamic editable redirects, high-resolution vector SVG export, and privacy-first scan analytics. No expiring links or subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
