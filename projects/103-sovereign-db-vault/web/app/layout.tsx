import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VaultEngine — Sovereign Database Point-in-Time Recovery (PITR) to S3',
  description: 'Ditch the 120% AWS RDS tax. Continuous transaction archiving, sub-second RPO, and second-precision Point-in-Time Recovery to Amazon S3 for PostgreSQL & MySQL on raw EC2.',
  keywords: [
    'AWS RDS alternative',
    'PostgreSQL PITR S3',
    'Point-in-Time Recovery Postgres',
    'MySQL binlog S3 continuous backup',
    'Self-hosted RDS alternative',
    'EC2 PostgreSQL backup',
    'Sovereign database backup',
    'Database disaster recovery S3',
    'WAL-G alternative',
    'pgBackRest alternative'
  ],
  authors: [{ name: 'OpenSourceHub Sovereign Team' }],
  creator: 'OpenSourceHub',
  metadataBase: new URL('https://vaultengine-pitr.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VaultEngine — Continuous Point-in-Time Recovery to S3 on Raw EC2',
    description: 'Save 60%–120% on cloud database fees. Single static memory-safe daemon providing sub-second continuous WAL/binlog streaming and instant second-precision recovery.',
    url: 'https://vaultengine-pitr.vercel.app',
    siteName: 'VaultEngine',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultEngine — Sovereign Database PITR & S3 Continuous Archiving',
    description: 'Break free from RDS markups. Automated continuous transaction streaming to Amazon S3 with second-precision recovery on standard Linux/EC2.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "VaultEngine",
        "operatingSystem": "Linux (x86_64, aarch64)",
        "applicationCategory": "DeveloperApplication",
        "description": "Sovereign continuous database transaction archiver and Point-in-Time Recovery (PITR) engine to Amazon S3 for PostgreSQL and MySQL on raw EC2.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Continuous PostgreSQL WAL & MySQL Binlog streaming to Amazon S3",
          "Second-precision Point-in-Time Recovery (PITR)",
          "Zero-secret AWS IMDSv2 IAM role auto-discovery",
          "Memory-friendly standalone binary (< 15MB RAM footprint)",
          "Client-side AES-256 envelope encryption",
          "Local disk ring-buffer with backpressure & watermark protection"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why run PostgreSQL or MySQL on EC2 instead of AWS RDS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AWS RDS charges a 60% to 120% markup on compute, plus extra fees on IOPS, Multi-AZ storage doubling, and backup storage overages. With VaultEngine, you get identical continuous Point-in-Time Recovery (PITR) directly to Amazon S3 at raw EC2 and S3 storage costs, saving thousands of dollars per database annually."
            }
          },
          {
            "@type": "Question",
            "name": "How does VaultEngine achieve Point-in-Time Recovery without RDS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "VaultEngine hooks natively into the database engine: for PostgreSQL, it continuously streams Write-Ahead Logs (WAL) as they close; for MySQL, it replicates the binary log stream. In the event of data loss or human error, VaultEngine fetches the closest preceding physical base snapshot and replays transaction logs up to the exact second requested."
            }
          },
          {
            "@type": "Question",
            "name": "Does VaultEngine require static AWS Access Keys?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. VaultEngine natively queries the AWS EC2 Instance Metadata Service v2 (IMDSv2) to automatically assume temporary STS credentials from your attached IAM instance profile. No AWS access keys are ever stored on disk or in environment variables."
            }
          },
          {
            "@type": "Question",
            "name": "How does VaultEngine prevent local disk full panics if S3 is unreachable?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "VaultEngine implements a bounded local spool ring buffer. If network connectivity drops or S3 returns 503 SlowDown, transactions are spooled locally with exponential backoff. If disk usage crosses the 85% safety watermark, VaultEngine triggers alerts and activates backpressure throttling to protect database availability."
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className={`dark scroll-smooth ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#07080a] text-zinc-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
