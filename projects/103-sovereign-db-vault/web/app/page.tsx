'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Clock,
  HardDrive,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  Database,
  Lock,
  RefreshCw,
  Server,
  Layers,
  Cpu,
  Github,
} from 'lucide-react';
import CostCalculator from '@/components/CostCalculator';
import PitrSimulator from '@/components/PitrSimulator';
import QuickstartTabs from '@/components/QuickstartTabs';
import CliReference from '@/components/CliReference';
import ComparisonTable from '@/components/ComparisonTable';
import FaqSection from '@/components/FaqSection';

export default function Home() {
  const [copied, setCopied] = useState<boolean>(false);
  const installCmd = 'curl -sSL https://vaultengine-pitr.vercel.app/install.sh | sudo bash';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 bg-dot-pattern selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white text-lg">VaultEngine</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase -mt-1 tracking-wider">
                Sovereign Database PITR
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              Savings Calculator
            </a>
            <a href="#simulator" className="hover:text-white transition-colors">
              PITR Simulator
            </a>
            <a href="#quickstart" className="hover:text-white transition-colors">
              Quickstart
            </a>
            <a href="#docs" className="hover:text-white transition-colors">
              CLI Reference
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#quickstart"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Install CLI</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 max-w-5xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Zero-SaaS • Sovereign Database Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Ditch the 120% AWS RDS Tax.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Continuous Point-in-Time Recovery
          </span>{' '}
          to S3 on Raw EC2.
        </h1>

        <p className="max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg mb-8 leading-relaxed">
          Self-host PostgreSQL and MySQL on standard Linux instances without fear. Single memory-safe daemon providing
          continuous transaction log streaming, zero static AWS secrets, and second-precision disaster recovery.
        </p>

        {/* 1-Line Quickstart Box */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 p-2 sm:p-2.5 rounded-2xl shadow-2xl font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 pl-3 text-indigo-300 overflow-x-auto select-all">
              <span className="text-zinc-600">$</span>
              <span>{installCmd}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 mt-3 font-mono">
            <span>✓ Single Static Binary</span>
            <span>•</span>
            <span>✓ IMDSv2 IAM Auto-Discovery</span>
            <span>•</span>
            <span>✓ &lt; 15MB RAM</span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Value Pillars */}
      <section id="features" className="max-w-5xl mx-auto px-4 my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="shimmer-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Zero-Secret IAM Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Queries AWS EC2 IMDSv2 for temporary STS tokens. No AWS Access Keys in .env files or on disk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 font-mono text-[11px] text-indigo-400">
              IMDSv2 Enforced
            </div>
          </div>

          <div className="shimmer-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Sub-Second RPO Streaming</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Postgres WAL & MySQL binlog streaming compressed with Zstandard directly into S3 multipart uploads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 font-mono text-[11px] text-emerald-400">
              RPO &lt; 3 Seconds
            </div>
          </div>

          <div className="shimmer-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Second-Precision PITR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Restore database state to any exact historical second. Recovers instantly from accidental DROP or DELETE
                statements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 font-mono text-[11px] text-amber-400">
              1-Command Rollback
            </div>
          </div>

          <div className="shimmer-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Ultra-Low Overhead</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Written in memory-safe Rust with zero GC stalls. Consumes less than 15MB RAM on your database host.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 font-mono text-[11px] text-rose-400">
              &lt; 15 MB RAM Footprint
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <CostCalculator />

      {/* Interactive PITR Simulator */}
      <PitrSimulator />

      {/* Quickstart & IAM Setup */}
      <QuickstartTabs />

      {/* 1-Page CLI Reference */}
      <CliReference />

      {/* Comparison Matrix */}
      <ComparisonTable />

      {/* FAQ Section */}
      <FaqSection />

      {/* Final Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 my-20">
        <div className="shimmer-card p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-900">
          <div className="accent-border-top" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Take Control of Your Database Infrastructure Today
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Deploy VaultEngine on your EC2 host in 60 seconds. Start streaming transactions to S3 and eliminate the RDS
            markup permanently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#quickstart"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]"
            >
              <Terminal className="w-4 h-4" />
              <span>Get Started Now</span>
            </a>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              <span>Read Documentation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Database className="w-3 h-3" />
            </div>
            <span className="text-zinc-300 font-bold">VaultEngine</span>
            <span>— Sovereign Database Infrastructure</span>
          </div>
          <div>Open-Source Software • MIT License • Zero Tracking</div>
        </div>
      </footer>
    </div>
  );
}
