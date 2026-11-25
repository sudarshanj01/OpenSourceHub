import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shield — Sovereign Secret Isolation for the Agentic Era',
  description:
    'The zero-trust in-memory secret vault. Shreds plaintext .env from disk, locks secrets with Argon2id + AES-256-GCM, and injects secrets directly into process RAM. Defeats AI agent leaks with zero root privileges.',
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
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#14110f] text-[#cfb8a2] min-h-screen antialiased selection:bg-[#ef9846]/30 selection:text-[#fbfbf9]">
        {children}
      </body>
    </html>
  );
}
