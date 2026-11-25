'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, Cloud, HardDrive, ArrowRight, Server, Lock, Layers } from 'lucide-react';

export default function ArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState<number>(0);

  const steps = [
    {
      id: 0,
      title: 'PostgreSQL / MySQL Engine',
      subtitle: 'Native Write-Ahead Logs',
      icon: Database,
      badge: 'Engine Level',
      desc: 'Hooks directly into database write streams. Every commit writes a WAL segment or binlog event. Maximum latency: 3 seconds.',
      detail: 'wal_level=replica, archive_timeout=60s. Zero table locking.',
    },
    {
      id: 1,
      title: 'Local Ring Buffer Spool',
      subtitle: 'Disk Watermark Safety',
      icon: HardDrive,
      badge: 'Backpressure',
      desc: 'Buffers logs in a bounded local queue. If S3 throttles or network partitions, database never crashes. Spool throttles at 85% disk.',
      detail: 'Bounded 5GB ring buffer with jittered exponential retry.',
    },
    {
      id: 2,
      title: 'VaultEngine Static Daemon',
      subtitle: 'In-Memory AES-256 + zstd',
      icon: ShieldCheck,
      badge: '< 15MB RAM',
      desc: 'Compresses blocks via Zstandard (-3) and encrypts with AES-256-GCM in memory before bytes ever leave host socket.',
      detail: 'Zero disk spill of unencrypted logs. Written in Rust.',
    },
    {
      id: 3,
      title: 'AWS IMDSv2 Auth Route',
      subtitle: 'Zero Static AWS Keys',
      icon: Lock,
      badge: 'Zero-Secret',
      desc: 'Automatically fetches short-lived STS credentials from EC2 IAM Instance Profile. No credentials in .env or config files.',
      detail: 'Queries 169.254.169.254 with session token TTL.',
    },
    {
      id: 4,
      title: 'Amazon S3 Standard Vault',
      subtitle: 'Immutable Replication',
      icon: Cloud,
      badge: '$0.023 / GB',
      desc: 'S3 Multipart Upload with SHA-256 integrity tags. Automatic lifecycle moves older logs to Glacier Instant Retrieval.',
      detail: 'Full point-in-time recovery to any microsecond timestamp.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="surface-card p-6 sm:p-10 relative overflow-hidden">
        <div className="bevel-top" />
        <div className="accent-glow-top" />

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Layers className="w-3.5 h-3.5" />
            In-Depth System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Zero-Trust Continuous Pipeline
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Click any node in the topology below to inspect its data flow, encryption boundary, and failure resilience.
          </p>
        </div>

        {/* Horizontal Node Track */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            const isSelected = activeNode === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveNode(step.id)}
                className={`p-4 rounded-xl text-left transition-all relative flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)]'
                    : 'bg-[#0a0c10] border-white/[0.05] hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                      0{step.id + 1}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white leading-tight mb-1">{step.title}</div>
                  <div className="text-[11px] text-zinc-400">{step.subtitle}</div>
                </div>
                <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-indigo-400">
                  {step.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Deep Dive Inspector */}
        <div className="p-6 rounded-2xl bg-[#090b0f] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                Node Specification:
              </span>
              <span className="text-sm font-bold text-white">{steps[activeNode].title}</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{steps[activeNode].desc}</p>
            <div className="text-xs font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
              <span>Technical Guarantee:</span>
              <span className="text-zinc-300">{steps[activeNode].detail}</span>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs">
            <span>Stage 0{activeNode + 1} of 05</span>
          </div>
        </div>
      </div>
    </div>
  );
}
