import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CarePlus Clinic | Doctor Appointment & Queue System',
  description: 'Self-hosted, private appointment scheduling and queue management system for independent doctors and neighborhood clinics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
