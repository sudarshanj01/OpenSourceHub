'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Terminal,
  Lock,
  Unlock,
  Edit3,
  Eye,
  Activity,
  Play,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface DocCommand {
  name: string;
  syntax: string;
  badge: string;
  summary: string;
  details: string[];
  examples: { cmd: string; desc: string }[];
  icon: React.ElementType;
}

const COMMANDS: DocCommand[] = [
  {
    name: 'shield seal',
    syntax: 'shield seal [FILE] [--vault PATH]',
    badge: 'Encryption',
    summary:
      'Encrypts your plaintext .env file into an authenticated .env.vault using Argon2id + AES-256-GCM, then securely shreds the original plaintext file from disk.',
    details: [
      'Prompts interactively for a new Master Password and confirmation.',
      'Derives a 256-bit key via Argon2id (64 MiB memory, 3 iterations, 4 lanes).',
      'Overwrites the original .env with random bytes before unlinking.',
      'Safe to commit .env.vault directly to Git repositories.',
    ],
    examples: [
      { cmd: 'shield seal', desc: 'Seal default .env into .env.vault' },
      { cmd: 'shield seal .env.production', desc: 'Seal a specific environment file' },
      { cmd: 'shield seal .env --vault secrets.vault', desc: 'Specify a custom vault output path' },
    ],
    icon: Lock,
  },
  {
    name: 'shield <command>',
    syntax: 'shield <ANY_COMMAND> [ARGS...]',
    badge: 'RAM Execution',
    summary:
      'Decrypts .env.vault in memory, injects all variables directly into the child process environment, and executes your command without ever writing plaintext to disk.',
    details: [
      'No wrapper flags or double-dash (`--`) required — just prefix any command with `shield`.',
      'Master password and decrypted secrets are wiped from RAM with `zeroize` after fork.',
      'Sets `PR_SET_DUMPABLE=0` on Linux to block ptrace and `/proc/$PID/mem` inspection.',
      'Also supports `shield run -- <cmd>` for explicit separation.',
    ],
    examples: [
      { cmd: 'shield npm run dev', desc: 'Start Next.js / Node dev server with secrets in RAM' },
      { cmd: 'shield python main.py', desc: 'Run Python application with injected env vars' },
      { cmd: 'shield docker compose up', desc: 'Pass vault secrets to Docker Compose' },
      { cmd: 'shield cat .env', desc: 'Inspect decrypted .env in stdout without touching disk' },
    ],
    icon: Play,
  },
  {
    name: 'shield edit',
    syntax: 'shield edit [--vault PATH]',
    badge: 'In-RAM Editor',
    summary:
      'Opens your decrypted secrets inside an ephemeral RAM-only buffer using `$EDITOR` (or `nano` / `vi`), then re-encrypts with a fresh salt and nonce on save.',
    details: [
      'Uses `/dev/shm` tmpfs on Linux (volatile RAM, never touches SSD/NVMe).',
      'Shreds the temporary buffer immediately when the editor exits.',
      'Generates a brand new 16-byte Argon2id salt and 96-bit AES-GCM nonce.',
    ],
    examples: [
      { cmd: 'shield edit', desc: 'Edit .env.vault in your default terminal editor' },
      { cmd: 'EDITOR=vim shield edit', desc: 'Force Vim for this edit session' },
    ],
    icon: Edit3,
  },
  {
    name: 'shield view',
    syntax: 'shield view [--vault PATH]',
    badge: 'Read-Only',
    summary:
      'Prompts for your Master Password and prints the decrypted key-value pairs directly to stdout without creating any temporary files.',
    details: [
      'Useful for quickly verifying API keys or database URLs.',
      'Zero disk writes; output stays strictly in your terminal scrollback.',
    ],
    examples: [
      { cmd: 'shield view', desc: 'Decrypt and print .env.vault to stdout' },
    ],
    icon: Eye,
  },
  {
    name: 'shield unseal',
    syntax: 'shield unseal [--vault PATH] [--out FILE]',
    badge: 'Restore',
    summary:
      'Decrypts .env.vault and writes the plaintext .env back to disk if you need to export or migrate away from Shield.',
    details: [
      'Requires your Master Password to authenticate and decrypt the vault.',
      'Restores exact original formatting and comments.',
    ],
    examples: [
      { cmd: 'shield unseal', desc: 'Restore .env.vault back to .env on disk' },
    ],
    icon: Unlock,
  },
  {
    name: 'shield status',
    syntax: 'shield status',
    badge: 'Diagnostics',
    summary:
      'Audits the current directory to verify whether `.env.vault` is sealed and confirms zero plaintext `.env` files remain exposed to AI agents.',
    details: [
      'Does not require your Master Password.',
      'Reports vault presence, encryption standard, and any exposed plaintext `.env*` files.',
    ],
    examples: [
      { cmd: 'shield status', desc: 'Check repository secret protection status' },
    ],
    icon: Activity,
  },
];

function CopyInline({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator?.clipboard?.writeText(text);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md bg-[#201b17] hover:bg-[#ef9846] text-[#a89785] hover:text-[#14110f] transition-colors"
      title="Copy command"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function DocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#14110f] text-[#cfb8a2] font-sans selection:bg-[#ef9846]/30 selection:text-[#fbfbf9]">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[960px] mx-auto px-6">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#a89785] hover:text-[#ef9846] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-14 pb-10 border-b border-[#ef9846]/15">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/25 text-[#ef9846] text-xs font-mono uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              CLI Reference &amp; Documentation
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-[#fbfbf9] tracking-tight mb-4">
              Shield Command Reference
            </h1>
            <p className="text-base text-[#cfb8a2] leading-relaxed max-w-2xl">
              Complete guide to installing and operating <code className="text-[#ef9846] font-mono">shield</code> (also aliased as <code className="text-[#ef9846] font-mono">envshield</code>). All secrets stay encrypted on disk and are decrypted solely in volatile RAM.
            </p>
          </div>

          {/* Quick Install Section */}
          <section className="mb-16">
            <h2 className="font-display font-bold text-2xl text-[#fbfbf9] mb-4 flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-[#ef9846]" />
              Installation
            </h2>
            <div className="rounded-2xl bg-[#1a1613] border border-[#ef9846]/20 p-6 space-y-4">
              <div>
                <div className="text-xs font-mono text-[#a89785] mb-2">Linux / macOS (Zero-Root)</div>
                <div className="flex items-center justify-between gap-3 bg-[#14110f] border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-[#f8cba2]">
                  <span className="truncate">
                    <span className="text-[#ef9846] mr-2">$</span>
                    curl -sSL https://shield.opensourcehub.dpdns.org/install.sh | bash
                  </span>
                  <CopyInline text="curl -sSL https://shield.opensourcehub.dpdns.org/install.sh | bash" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#a89785] mb-2">Cargo (Build from Source)</div>
                <div className="flex items-center justify-between gap-3 bg-[#14110f] border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-[#f8cba2]">
                  <span className="truncate">
                    <span className="text-[#ef9846] mr-2">$</span>
                    cargo install --git https://github.com/sudarshanj01/OpenSourceHub shield
                  </span>
                  <CopyInline text="cargo install --git https://github.com/sudarshanj01/OpenSourceHub shield" />
                </div>
              </div>
            </div>
          </section>

          {/* Commands List */}
          <section className="space-y-8">
            <h2 className="font-display font-bold text-2xl text-[#fbfbf9] mb-2 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#ef9846]" />
              All CLI Commands
            </h2>

            {COMMANDS.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.name}
                  id={cmd.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}
                  className="rounded-2xl bg-[#1a1613] border border-[#ef9846]/15 hover:border-[#ef9846]/35 transition-colors p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ef9846]/40 to-transparent" />

                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#201b17] border border-[#ef9846]/30 flex items-center justify-center text-[#ef9846]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-lg text-[#fbfbf9]">{cmd.name}</h3>
                        <div className="font-mono text-xs text-[#8e7a68]">{cmd.syntax}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[#ef9846] bg-[#ef9846]/10 px-2.5 py-1 rounded-full border border-[#ef9846]/20">
                      {cmd.badge}
                    </span>
                  </div>

                  <p className="text-sm text-[#cfb8a2] leading-relaxed mb-5">{cmd.summary}</p>

                  <ul className="space-y-1.5 mb-6 text-xs text-[#a89785]">
                    {cmd.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#ef9846] mt-0.5">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8e7a68]">
                      Examples
                    </div>
                    {cmd.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#14110f] border border-white/5 rounded-xl px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2 font-mono text-xs text-[#f8cba2] min-w-0">
                          <span className="text-[#ef9846] select-none">$</span>
                          <span className="truncate">{ex.cmd}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className="text-[11px] text-[#8e7a68]">{ex.desc}</span>
                          <CopyInline text={ex.cmd} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
