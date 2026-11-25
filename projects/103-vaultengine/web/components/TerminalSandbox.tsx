'use client';

import React, { useState } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw, Copy, Check, Circle } from 'lucide-react';

interface CommandOutput {
  cmd: string;
  lines: { text: string; color: string }[];
}

const PRESETS: Record<string, CommandOutput> = {
  status: {
    cmd: 'vaultengine status',
    lines: [
      { text: '=========================================================', color: 'text-indigo-400' },
      { text: '               VaultEngine Operational Status            ', color: 'text-white font-bold' },
      { text: '=========================================================', color: 'text-indigo-400' },
      { text: 'Database Engine           : PostgreSQL 16.4', color: 'text-emerald-400 font-semibold' },
      { text: 'Database Target           : production_orders_db', color: 'text-zinc-200' },
      { text: 'Host / Port               : 127.0.0.1:5432 (Local Socket)', color: 'text-zinc-300' },
      { text: 'Data Directory            : /var/lib/postgresql/16/main', color: 'text-zinc-400' },
      { text: '', color: 'text-zinc-500' },
      { text: '--- S3 Storage & Sovereign Cloud ---', color: 'text-indigo-300' },
      { text: 'Target Bucket             : s3://vaultengine-prod-20261121', color: 'text-zinc-200 font-semibold' },
      { text: 'AWS Region                : us-east-1 (N. Virginia)', color: 'text-zinc-400' },
      { text: 'Auth Mechanism            : EC2 IAM Instance Profile (IMDSv2 Zero-Secret)', color: 'text-emerald-400 font-bold' },
      { text: 'Encryption                : In-Memory AES-256-GCM Envelope', color: 'text-zinc-300' },
      { text: '', color: 'text-zinc-500' },
      { text: '--- Recovery & Replication Metrics ---', color: 'text-indigo-300' },
      { text: 'Latest Base Snapshot      : base_20261121_020000.tar.gz (14.2 GB)', color: 'text-zinc-300' },
      { text: 'Latest Archived Segment   : 00000001000000020000009F (LSN 2/9F00000)', color: 'text-zinc-300' },
      { text: 'Current RPO Lag           : 2.1s (Real-Time Synchronous)', color: 'text-emerald-400 font-bold' },
      { text: 'Engine Health             : PROTECTED & STREAMING (0 Errors)', color: 'text-emerald-400 font-bold' },
      { text: '=========================================================', color: 'text-indigo-400' },
    ],
  },
  backup: {
    cmd: 'vaultengine backup --label "pre_release_snapshot"',
    lines: [
      { text: '[BACKUP] Initiating non-blocking hot physical snapshot for PostgreSQL...', color: 'text-indigo-400' },
      { text: '✓ pg_backup_start() executed (Consistent Checkpoint LSN 0/14A0028)', color: 'text-emerald-400' },
      { text: '→ Streaming data cluster via parallel zstd compression (-3)...', color: 'text-zinc-400' },
      { text: '→ Encrypting chunk blocks with AES-256-GCM before socket write...', color: 'text-zinc-400' },
      { text: '→ S3 Multipart Upload completed: 18 chunks (14.8 GB compressed)', color: 'text-zinc-300' },
      { text: '✓ pg_backup_stop() executed. Base snapshot closed safely.', color: 'text-emerald-400' },
      { text: '✓ S3 Key: s3://vaultengine-prod/snapshots/base_20261121_215000.tar.gz', color: 'text-white font-mono' },
      { text: '✓ Integrity SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', color: 'text-indigo-300' },
      { text: 'Done in 42.1 seconds. Zero table locks acquired.', color: 'text-emerald-400 font-bold' },
    ],
  },
  restore: {
    cmd: 'vaultengine restore --target-time "2026-11-21 14:32:04 UTC" --into /var/lib/postgresql/restored',
    lines: [
      { text: '=== VaultEngine Point-in-Time Recovery (PITR) Engine ===', color: 'text-indigo-400 font-bold' },
      { text: 'Target Timestamp : 2026-11-21 14:32:04 UTC (Pre-Disaster Second)', color: 'text-white' },
      { text: 'Destination Path : /var/lib/postgresql/restored', color: 'text-zinc-300' },
      { text: '', color: 'text-zinc-500' },
      { text: '1. Resolving nearest preceding base snapshot in S3...', color: 'text-zinc-400' },
      { text: '   ✓ Located base_20261121_140000.tar.gz in S3 (preceding by 32m 4s)', color: 'text-emerald-400' },
      { text: '2. Streaming & decompressing base snapshot into destination...', color: 'text-zinc-400' },
      { text: '   ✓ Extracted 14.2 GB cluster files [Verified SHA-256]', color: 'text-emerald-400' },
      { text: '3. Calculating WAL lineage replay chain up to 14:32:04 UTC...', color: 'text-zinc-400' },
      { text: '   ✓ 32 continuous WAL segments resolved from S3', color: 'text-emerald-400' },
      { text: '4. Injecting recovery.signal and target timeline promote rules...', color: 'text-zinc-400' },
      { text: '   ✓ recovery.signal written', color: 'text-emerald-400' },
      { text: '   ✓ recovery_target_time = \'2026-11-21 14:32:04 UTC\' configured', color: 'text-emerald-400' },
      { text: '', color: 'text-zinc-500' },
      { text: '🎉 Restoration Staged! Zero data loss. Start database:', color: 'text-emerald-400 font-bold' },
      { text: '   $ pg_ctl -D /var/lib/postgresql/restored start', color: 'text-white font-bold' },
    ],
  },
  doctor: {
    cmd: 'vaultengine doctor',
    lines: [
      { text: '=== Running VaultEngine S3 & IAM Diagnostics ===', color: 'text-indigo-400 font-bold' },
      { text: '1. Checking EC2 IMDSv2 token endpoint (http://169.254.169.254)...', color: 'text-zinc-400' },
      { text: '   [PASS] IMDSv2 token acquired (TTL: 21600s)', color: 'text-emerald-400' },
      { text: '   [PASS] Attached IAM Role: "Ec2DatabaseSovereignBackupRole"', color: 'text-emerald-400' },
      { text: '2. Verifying S3 IAM Permissions...', color: 'text-zinc-400' },
      { text: '   [PASS] s3:PutObject verified (Created test segment in 28ms)', color: 'text-emerald-400' },
      { text: '   [PASS] s3:GetObject verified (Stream checksum match in 19ms)', color: 'text-emerald-400' },
      { text: '   [PASS] s3:ListBucket verified', color: 'text-emerald-400' },
      { text: '3. Checking Local Disk Spool Permissions...', color: 'text-zinc-400' },
      { text: '   [PASS] 240 GB available on volume (Spool limit set to 5 GB)', color: 'text-emerald-400' },
      { text: '', color: 'text-zinc-500' },
      { text: '✓ All systems operational. Database host is production ready.', color: 'text-emerald-400 font-bold' },
    ],
  },
};

export default function TerminalSandbox() {
  const [activeKey, setActiveKey] = useState<string>('status');
  const [copied, setCopied] = useState<boolean>(false);

  const activeOutput = PRESETS[activeKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeOutput.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-16 px-4">
      <div className="surface-card overflow-hidden">
        <div className="bevel-top" />
        <div className="accent-glow-top" />

        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 bg-[#0b0d12] border-b border-white/[0.06] gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <Circle className="w-3 h-3 fill-rose-500/80 text-rose-500" />
              <Circle className="w-3 h-3 fill-amber-500/80 text-amber-500" />
              <Circle className="w-3 h-3 fill-emerald-500/80 text-emerald-500" />
            </div>
            <TerminalIcon className="w-4 h-4 text-indigo-400 ml-2" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              vaultengine-daemon — bash — 120x36
            </span>
          </div>

          {/* Interactive Command Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveKey('status')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                activeKey === 'status'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              status
            </button>
            <button
              type="button"
              onClick={() => setActiveKey('backup')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                activeKey === 'backup'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              backup
            </button>
            <button
              type="button"
              onClick={() => setActiveKey('restore')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                activeKey === 'restore'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              restore (PITR)
            </button>
            <button
              type="button"
              onClick={() => setActiveKey('doctor')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                activeKey === 'doctor'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              doctor
            </button>
          </div>
        </div>

        {/* Command Line Prompt */}
        <div className="p-4 px-6 bg-[#07080a] border-b border-white/[0.04] flex items-center justify-between font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-emerald-400 font-bold">ec2-user@db-master:~$</span>
            <span className="text-indigo-300 font-semibold">{activeOutput.cmd}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Terminal Output Body */}
        <div className="p-6 bg-[#07080a] font-mono text-xs leading-relaxed overflow-x-auto max-h-[380px] space-y-1">
          {activeOutput.lines.map((line, idx) => (
            <div key={idx} className={`${line.color} whitespace-pre`}>
              {line.text}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-zinc-500">
            <span className="text-emerald-400">ec2-user@db-master:~$</span>
            <span className="w-2 h-4 bg-indigo-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
