import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital QR Menu & Order Board",
  description: "Live interactive restaurant menu with real-time dish availability, veg/non-veg filters, and table tray bill estimation with GST breakdown.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#E23744",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-900 bg-white selection:bg-zred-100 selection:text-zred-900">
        {children}
      </body>
    </html>
  );
}
