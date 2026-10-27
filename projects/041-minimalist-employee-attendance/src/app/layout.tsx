import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Attendance & Time-Clock System | OpenSourceHub",
  description: "Self-hosted, mobile-first employee attendance kiosk, live staff floor board, and monthly timesheet payroll exporter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
