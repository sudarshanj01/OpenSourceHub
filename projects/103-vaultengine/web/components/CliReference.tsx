'use client';

import React from 'react';
import { BookOpen, Command, ShieldCheck, Terminal, Cpu, Database } from 'lucide-react';

export default function CliReference() {
  const commands = [
    {
      name: 'vaultengine init',
      desc: 'Interactive guided setup wizard. Detects database engine, validates AWS IMDSv2 IAM role, tests S3 bucket connectivity, and auto-generates engine configs.',
      flags: ['--force (-f): Overwrite existing configuration file', '--config (-c): Custom configuration file path'],
      example: 'vaultengine init',
    },
    {
      name: 'vaultengine daemon',
      desc: 'Runs the continuous archiving background service. Monitors WAL/binlog queue, enforces disk watermark safety, and triggers scheduled physical snapshots.',
      flags: ['--detached (-d): Run detached in the background'],
      example: 'vaultengine daemon',
    },
    {
      name: 'vaultengine backup',
      desc: 'Triggers an on-demand, non-blocking physical base snapshot of the database cluster with Zstandard compression and SHA-256 checksum verification.',
      flags: ['--label (-l): Human-readable descriptive tag for the snapshot'],
      example: 'vaultengine backup --label "pre_black_friday_migration"',
    },
    {
      name: 'vaultengine status',
      desc: 'Displays operational health, last base snapshot timestamp, last archived transaction sequence, current RPO lag in seconds, and S3 storage volume.',
      flags: ['None'],
      example: 'vaultengine status',
    },
    {
      name: 'vaultengine restore',
      desc: 'Executes Point-in-Time Recovery down to the exact second. Unpacks the nearest base snapshot and replays transaction logs from Amazon S3.',
      flags: [
        '--target-time (-t): Exact recovery timestamp (e.g. "2026-11-21 14:32:00 UTC")',
        '--into (-i): Target destination directory for the restored database cluster',
        '--dry-run: Verifies S3 snapshot and WAL/binlog chain integrity without writing',
      ],
      example: 'vaultengine restore --target-time "2026-11-21 14:32:04 UTC" --into /var/lib/postgresql/restored',
    },
    {
      name: 'vaultengine doctor',
      desc: 'Diagnoses AWS IMDSv2 connectivity, IAM instance profile permissions, network routing to S3 endpoints, and local disk write permissions.',
      flags: ['None'],
      example: 'vaultengine doctor',
    },
  ];

  return (
    <div id="docs" className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Complete 1-Page Manual
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            CLI & Subcommands Reference
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Everything you need to orchestrate backups, monitor replication lag, and perform second-precision recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {commands.map((cmd) => (
            <div
              key={cmd.name}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-indigo-400 font-bold text-sm">
                  <Command className="w-4 h-4 text-indigo-500" />
                  <span>{cmd.name}</span>
                </div>
                <p className="text-xs text-zinc-300 mb-4 leading-relaxed">{cmd.desc}</p>

                <div className="space-y-1 mb-4">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold tracking-wider">
                    Flags:
                  </span>
                  {cmd.flags.map((flag, idx) => (
                    <div key={idx} className="text-[11px] font-mono text-zinc-400 pl-2 border-l border-zinc-800">
                      {flag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 font-mono text-xs text-zinc-400 flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Usage:</span>
                <span className="text-zinc-200 select-all">$ {cmd.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
