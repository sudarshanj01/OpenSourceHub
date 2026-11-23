import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EnvShield — Sovereign Kernel .env Guard & AI Agent DLP',
  description: 'Intercepts unauthorized .env access at the Linux kernel level via fanotify. Blocks AI agents, malicious scripts, and unauthorized reads with an instant desktop modal prompt.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased bg-dot-pattern selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
