import React from 'react';
import Navbar from '@/components/Navbar';
import Simulator from '@/components/Simulator';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import Quickstart from '@/components/Quickstart';
import ThreatMatrix from '@/components/ThreatMatrix';
import { Shield, Lock, Terminal, Cpu, Zap, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]">
            <Shield className="w-4 h-4" />
            Sovereign Kernel DLP for the Agentic AI Era
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Stop AI Agents From Leaking Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              .env Secrets.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            AI coding agents (Claude Code, Cursor, Aider, OpenDevin) run under your exact developer UID. They can freely <code className="text-zinc-200 font-mono">cat .env</code>, embed API keys into LLM context, or push secrets to Git.
            <strong className="text-zinc-200"> EnvShield</strong> intercepts file access at the Linux kernel boundary (<code className="text-emerald-400 font-mono">fanotify</code>), freezing unauthorized processes and demanding a Master Password before a single byte is read.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#simulator"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-[0_0_25px_-3px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              Try Live Simulator
            </a>
            <a
              href="#quickstart"
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              Install CLI (<code className="text-emerald-400 font-mono">&lt; 8MB</code>)
            </a>
          </div>
        </section>

        {/* Bento Grid Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Interception Speed</div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              &lt; 0.5 <span className="text-emerald-400 text-lg">µs</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Synchronous kernel-space decision. Non-.env file reads pass through with sub-microsecond latency.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">AI Agent Immunity</div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              100 <span className="text-cyan-400 text-lg">%</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Agents running in headless subshells cannot interact with the desktop modal or bypass kernel halts.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Scope & Coverage</div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              Global <span className="text-emerald-400 text-lg">Mount</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Zero project initialization needed. Every <code className="text-zinc-300 font-mono">.env</code> across all directories is guarded automatically.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Tamper Resistance</div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              Root <span className="text-red-400 text-lg">Daemon</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Runs as root systemd service. User-level agents cannot <code className="text-zinc-300 font-mono">kill -9</code> or delete the guard.
            </p>
          </div>
        </section>

        {/* Live Simulator Section */}
        <section id="simulator" className="scroll-mt-20">
          <Simulator />
        </section>

        {/* Kernel Architecture Section */}
        <section id="architecture" className="scroll-mt-20">
          <ArchitectureDiagram />
        </section>

        {/* Quickstart Guide */}
        <section id="quickstart" className="scroll-mt-20">
          <Quickstart />
        </section>

        {/* Threat Matrix Section */}
        <section id="matrix" className="scroll-mt-20">
          <ThreatMatrix />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-300">EnvShield</span>
            <span>• Sovereign Open-Source Project #104</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Released under MIT License</span>
            <span>•</span>
            <a
              href="https://github.com/sudarshanj01/OpenSourceHub"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              OpenSourceHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
