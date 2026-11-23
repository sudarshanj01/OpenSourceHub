'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, ShieldCheck, Download, Server } from 'lucide-react';

const COMMANDS = [
  {
    id: 'install',
    title: '1. One-Line Install & Setup',
    desc: 'Compiles and installs the single static Rust binary to /usr/local/bin/envshield and guides you through setting your Master Password.',
    cmd: 'cargo build --release && sudo cp target/release/envshield /usr/local/bin/\nsudo envshield init --install-service',
  },
  {
    id: 'watch',
    title: '2. Live Global Kernel Watch',
    desc: 'Starts real-time fanotify interception across the entire root mount (/). Every .env access prompts via desktop modal.',
    cmd: 'sudo envshield watch --all',
  },
  {
    id: 'status',
    title: '3. Inspect System Status & Logs',
    desc: 'View active protection status, watched patterns, systemd daemon health, and recent intercepted access attempts.',
    cmd: 'envshield status',
  },
  {
    id: 'scan',
    title: '4. Scan Filesystem for Shielded Secrets',
    desc: 'Locate every .env, .env.local, and .env.production file across your workspace that is shielded by the kernel.',
    cmd: 'envshield scan --path ~/workspace',
  },
  {
    id: 'uninstall',
    title: '5. Tamper-Proof Uninstallation',
    desc: 'Because the service runs as a root systemd daemon, no agent or user can kill it. Uninstallation strictly requires your master password.',
    cmd: 'sudo envshield uninstall',
  },
];

export default function Quickstart() {
  const [activeCmd, setActiveCmd] = useState(COMMANDS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCmd.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 lg:p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-2">
            <Download className="w-3.5 h-3.5" />
            Zero-Dependency Single Rust Binary
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Deploy in 60 Seconds
          </h3>
          <p className="text-sm text-zinc-400">
            One single compiled binary. Zero external runtime dependencies. Runs as an untouchable systemd daemon.
          </p>
        </div>

        {/* Binary footprint badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono">
            Memory: <strong className="text-white">&lt; 12 MB RAM</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono">
            Binary: <strong className="text-white">&lt; 8 MB Static</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono">
            Overhead: <strong className="text-emerald-400">&lt; 0.5 µs latency</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation list */}
        <div className="lg:col-span-5 space-y-2">
          {COMMANDS.map((item) => {
            const isSelected = activeCmd.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCmd(item)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800 border-emerald-500/60 shadow-lg text-white'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{item.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Command code preview */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-zinc-950 border border-zinc-800/90 p-5 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-zinc-500 font-semibold">{activeCmd.title}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Command'}
              </button>
            </div>
            <pre className="text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {activeCmd.cmd}
            </pre>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>🛡️ Pinned to Linux 5.7+ kernel capabilities</span>
            <span className="text-zinc-400 font-semibold">Argon2id Hash Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
