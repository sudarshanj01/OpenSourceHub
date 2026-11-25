'use client';

import React, { useState } from 'react';
import { Lock, Zap, Clock, Cpu, Copy, Check, Terminal } from 'lucide-react';
import VaultLogo from '@/components/VaultLogo';
import ThreeDatabaseScene from '@/components/ThreeDatabaseScene';
import CostCalculator from '@/components/CostCalculator';
import PitrSimulator from '@/components/PitrSimulator';
import QuickstartTabs from '@/components/QuickstartTabs';
import CliReference from '@/components/CliReference';
import FaqSection from '@/components/FaqSection';

export default function Home() {
  const [copied, setCopied] = useState<boolean>(false);
  const [labTab, setLabTab] = useState<'pitr' | 'cost'>('pitr');
  const [docsTab, setDocsTab] = useState<'setup' | 'cli'>('setup');

  const installCmd = 'curl -sSL https://vaultengine.opensourcehub.dpdns.org/install.sh | sudo bash';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Minimal Sticky Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/85 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <VaultLogo className="w-7 h-7" />
            <span className="font-semibold tracking-tight text-white text-sm sm:text-base">
              VaultEngine
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <button onClick={() => scrollTo('architecture')} className="hover:text-white transition-colors">
              Architecture
            </button>
            <button onClick={() => scrollTo('lab')} className="hover:text-white transition-colors">
              Interactive Lab
            </button>
            <button onClick={() => scrollTo('quickstart')} className="hover:text-white transition-colors">
              Quickstart & CLI
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">
              FAQ
            </button>
          </nav>

          <button
            onClick={() => scrollTo('quickstart')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      </header>

      {/* Hero + Fixed Copy Bar + 3D WebGL Pipeline */}
      <section className="pt-12 pb-10 px-4 max-w-6xl mx-auto text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 mb-4">
          PostgreSQL 17 · MySQL 8.4 · Zero-Secret AWS IMDSv2
        </p>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.12] max-w-3xl mx-auto">
          Continuous S3 Point-in-Time Recovery for EC2 Databases.
        </h1>

        <p className="max-w-xl mx-auto text-zinc-400 text-sm sm:text-base mb-7 leading-relaxed">
          A single static Rust daemon delivering sub-second WAL &amp; binlog streaming, client-side AES-256 encryption,
          and second-precision rollback without AWS RDS markups.
        </p>

        {/* Fixed Unbreakable 1-Line Install Bar */}
        <div className="max-w-3xl w-full mx-auto mb-8">
          <div className="flex items-center gap-3 bg-[#0f1014] border border-zinc-800 hover:border-zinc-700 transition-colors px-4 py-3 rounded-xl font-mono text-xs sm:text-sm shadow-lg">
            <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-left text-zinc-200 select-all">
              <span className="text-zinc-500 mr-2 select-none">$</span>
              <span>{installCmd}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors shrink-0 border border-zinc-700/60"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-zinc-500 mt-2.5 font-mono">
            <span>Static Binary (&lt; 15 MB RAM)</span>
            <span>·</span>
            <span>No Static AWS Keys</span>
            <span>·</span>
            <span>MIT License</span>
          </div>
        </div>

        {/* Upgraded 3D WebGL Database Stream Scene */}
        <ThreeDatabaseScene />
      </section>

      {/* Core Guarantees */}
      <section id="architecture" className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-xl p-5">
            <Lock className="w-4 h-4 text-zinc-300 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Zero-Secret IAM</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reads temporary STS credentials via EC2 IMDSv2. No static AWS keys stored on disk.
            </p>
          </div>

          <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-xl p-5">
            <Zap className="w-4 h-4 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Sub-Second RPO</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Streams Zstd-compressed WAL &amp; binlog segments directly into S3 multipart uploads.
            </p>
          </div>

          <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-xl p-5">
            <Clock className="w-4 h-4 text-sky-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Second-Precision PITR</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Replays base snapshots and transaction logs up to any exact target timestamp.
            </p>
          </div>

          <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-xl p-5">
            <Cpu className="w-4 h-4 text-zinc-300 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">&lt; 15 MB Footprint</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Memory-safe Rust binary with bounded local ring-buffer backpressure protection.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Lab: PITR Simulator & Cost Model */}
      <section id="lab" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Interactive Lab</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Test second-precision recovery replay or model EC2 vs. RDS savings.
            </p>
          </div>
          <div className="inline-flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start">
            <button
              onClick={() => setLabTab('pitr')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                labTab === 'pitr' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              PITR Simulator
            </button>
            <button
              onClick={() => setLabTab('cost')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                labTab === 'cost' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              RDS Cost Calculator
            </button>
          </div>
        </div>
        {labTab === 'pitr' ? <PitrSimulator /> : <CostCalculator />}
      </section>

      {/* Quickstart & CLI Reference */}
      <section id="quickstart" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Deployment &amp; CLI</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Configure PostgreSQL or MySQL in 60 seconds and inspect available commands.
            </p>
          </div>
          <div className="inline-flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start">
            <button
              onClick={() => setDocsTab('setup')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                docsTab === 'setup' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              60-Second Setup
            </button>
            <button
              onClick={() => setDocsTab('cli')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                docsTab === 'cli' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              CLI Reference
            </button>
          </div>
        </div>
        {docsTab === 'setup' ? <QuickstartTabs /> : <CliReference />}
      </section>

      {/* Technical FAQ */}
      <section id="faq" className="py-4">
        <FaqSection />
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4 text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <VaultLogo className="w-5 h-5" />
            <span className="text-zinc-300 font-semibold">VaultEngine</span>
            <span>· OpenSourceHub</span>
          </div>
          <div>MIT License · Zero Telemetry</div>
        </div>
      </footer>
    </div>
  );
}
