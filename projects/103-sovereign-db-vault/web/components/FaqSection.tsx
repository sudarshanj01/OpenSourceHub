'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why run PostgreSQL or MySQL on EC2 instead of AWS RDS?',
      a: 'AWS RDS charges an extortionate 60% to 120% markup on raw compute infrastructure, doubles your storage cost for Multi-AZ deployments, charges heavily for provisioned IOPS, and imposes billable storage on backup snapshots over 1x DB size. VaultEngine eliminates this premium entirely by enabling production-grade continuous Point-in-Time Recovery directly to Amazon S3 on raw EC2 or any Linux host at raw compute and $0.023/GB-mo S3 storage rates.',
    },
    {
      q: 'How does VaultEngine achieve continuous Point-in-Time Recovery without RDS?',
      a: 'VaultEngine hooks natively into the database engine: for PostgreSQL, it archives Write-Ahead Logs (WAL) continuously as they close (or periodically via archive_timeout); for MySQL, it acts as an internal replication client streaming the binary log. In disaster scenarios, VaultEngine stages the closest preceding physical base snapshot and replays transaction logs up to the exact second requested.',
    },
    {
      q: 'Does VaultEngine require static AWS Access Keys in .env files?',
      a: 'Never. VaultEngine queries the AWS EC2 Instance Metadata Service v2 (IMDSv2) to automatically assume temporary STS credentials from your attached IAM instance profile. No AWS access keys or secrets are ever stored on disk, eliminating credential leakage risks.',
    },
    {
      q: 'What happens if S3 is throttled or the network connection drops?',
      a: 'VaultEngine includes a bounded local spool ring buffer. If Amazon S3 is momentarily unreachable or returns 503 SlowDown, transaction segments are buffered locally with exponential backoff and jitter. If disk usage crosses the 85% safety watermark, VaultEngine triggers warning notifications and activates backpressure throttling to prevent database crashes.',
    },
    {
      q: 'Is my data encrypted before it leaves the server?',
      a: 'Yes. VaultEngine features client-side envelope encryption. Data is compressed using Zstandard (zstd) and encrypted in-memory with AES-256-GCM before bytes ever hit the network socket to Amazon S3. Even cloud providers with root bucket access cannot inspect your database data.',
    },
    {
      q: 'Can VaultEngine be used with non-AWS S3 storage (e.g. MinIO, Cloudflare R2, Wasabi)?',
      a: 'Yes. While VaultEngine is optimized for zero-secret AWS EC2 IAM role discovery, it supports standard S3-compatible endpoints, enabling you to stream database transaction logs to Cloudflare R2, MinIO, Wasabi, or self-hosted Ceph object storage.',
    },
  ];

  return (
    <div id="faq" className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Everything You Need to Know
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Detailed technical and operational answers for systems engineers, DBAs, and startup founders.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm sm:text-base font-semibold text-zinc-100 hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
