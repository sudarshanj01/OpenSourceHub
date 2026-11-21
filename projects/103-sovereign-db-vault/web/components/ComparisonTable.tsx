'use client';

import React from 'react';
import { Check, X, Shield, Scale } from 'lucide-react';

export default function ComparisonTable() {
  const rows = [
    {
      feature: 'Point-in-Time Recovery (Second-Precision)',
      vaultengine: true,
      rds: true,
      walg: true,
      pgbackrest: true,
    },
    {
      feature: 'Cost: Raw EC2 & S3 Pricing (Zero SaaS Markup)',
      vaultengine: true,
      rds: false,
      walg: true,
      pgbackrest: true,
    },
    {
      feature: 'Zero-Secret AWS IMDSv2 IAM Auto-Discovery',
      vaultengine: true,
      rds: true,
      walg: false,
      pgbackrest: false,
    },
    {
      feature: 'Interactive Setup Wizard (Zero YAML config files)',
      vaultengine: true,
      rds: true,
      walg: false,
      pgbackrest: false,
    },
    {
      feature: 'Multi-Engine Support (Postgres + MySQL in one binary)',
      vaultengine: true,
      rds: true,
      walg: true,
      pgbackrest: false,
    },
    {
      feature: 'Disk Full Watermark & Backpressure Protection',
      vaultengine: true,
      rds: false,
      walg: false,
      pgbackrest: false,
    },
    {
      feature: 'Client-Side In-Memory AES-256 Encryption',
      vaultengine: true,
      rds: false,
      walg: true,
      pgbackrest: true,
    },
    {
      feature: 'Memory Footprint on Database Host',
      vaultengine: '< 15 MB RAM (Rust)',
      rds: 'Managed (Closed)',
      walg: '~35 MB RAM (Go)',
      pgbackrest: '~25 MB RAM (C)',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Scale className="w-3.5 h-3.5" />
            Competitive Evaluation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Why VaultEngine Outperforms Alternatives
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Engineered specifically to solve the configuration pain and high operational costs of enterprise database backups.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-4 px-4 font-semibold">Capability</th>
                <th className="py-4 px-4 font-bold text-indigo-400 bg-indigo-950/20 rounded-t-xl">VaultEngine</th>
                <th className="py-4 px-4 font-semibold">AWS RDS</th>
                <th className="py-4 px-4 font-semibold">WAL-G</th>
                <th className="py-4 px-4 font-semibold">pgBackRest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans text-zinc-200 font-medium">{row.feature}</td>

                  {/* VaultEngine */}
                  <td className="py-3.5 px-4 bg-indigo-950/20 font-bold text-indigo-300">
                    {typeof row.vaultengine === 'boolean' ? (
                      row.vaultengine ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )
                    ) : (
                      <span>{row.vaultengine}</span>
                    )}
                  </td>

                  {/* AWS RDS */}
                  <td className="py-3.5 px-4 text-zinc-400">
                    {typeof row.rds === 'boolean' ? (
                      row.rds ? (
                        <Check className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500/80" />
                      )
                    ) : (
                      <span>{row.rds}</span>
                    )}
                  </td>

                  {/* WAL-G */}
                  <td className="py-3.5 px-4 text-zinc-400">
                    {typeof row.walg === 'boolean' ? (
                      row.walg ? (
                        <Check className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )
                    ) : (
                      <span>{row.walg}</span>
                    )}
                  </td>

                  {/* pgBackRest */}
                  <td className="py-3.5 px-4 text-zinc-400">
                    {typeof row.pgbackrest === 'boolean' ? (
                      row.pgbackrest ? (
                        <Check className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )
                    ) : (
                      <span>{row.pgbackrest}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
