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
  Server,
  Layers,
  Cpu,
  Activity,
  ChevronRight,
} from 'lucide-react';
import ThreeDatabaseScene from '@/components/ThreeDatabaseScene';
import TerminalSandbox from '@/components/TerminalSandbox';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 bg-grid-mesh">
      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07080a]/85 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white text-base">VaultEngine</span>
              <span className="text-[10px] font-mono text-indigo-400 uppercase -mt-1 tracking-wider">
                Sovereign PITR
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
            <button
              onClick={() => scrollTo('features')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollTo('calculator')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cost Model
            </button>
            <button
              onClick={() => scrollTo('simulator')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Recovery Lab
            </button>
            <button
              onClick={() => scrollTo('quickstart')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Deployment
            </button>
            <button
              onClick={() => scrollTo('docs')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Manual
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo('quickstart')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] border border-indigo-400/30"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Get Binary</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sovereign Database Infrastructure • Zero SaaS Premium</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
          Continuous Point-in-Time Recovery to Amazon S3 on Raw Linux EC2
        </h1>

        <p className="max-w-2xl mx-auto text-zinc-400 text-sm sm:text-base mb-8 leading-relaxed">
          Break free from extortionate RDS compute and storage surcharges. A single static Rust daemon delivering
          sub-second WAL & binlog streaming, zero static AWS secrets, and second-precision rollback.
        </p>

        {/* 1-Line Quickstart Box */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-between bg-[#0b0d12] border border-white/[0.08] p-2.5 rounded-2xl shadow-2xl font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 pl-3 text-indigo-300 overflow-x-auto select-all">
              <span className="text-zinc-600">$</span>
              <span>{installCmd}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200 transition-colors flex-shrink-0 border border-white/[0.06]"
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
            <span>• Single Static Binary (&lt; 15MB RAM)</span>
            <span>• AWS IMDSv2 Discovery</span>
            <span>• Zero Dependencies</span>
          </div>
        </div>

        {/* 3D Interactive WebGL Database Stream Canvas */}
        <div className="surface-card p-2 sm:p-4 my-8 relative overflow-hidden">
          <div className="bevel-top" />
          <ThreeDatabaseScene />
        </div>
      </section>

      {/* Bento Grid: Core Value Pillars */}
      <section id="features" className="max-w-5xl mx-auto px-4 my-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Engine Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Built for Extreme Reliability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-6 flex flex-col justify-between">
            <div className="bevel-top" />
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Zero-Secret IAM Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Queries AWS EC2 IMDSv2 for temporary STS credentials. Never writes static AWS access keys to disk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] font-mono text-[10px] text-indigo-400">
              IMDSv2 Enforced
            </div>
          </div>

          <div className="surface-card p-6 flex flex-col justify-between">
            <div className="bevel-top" />
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Sub-Second RPO Streaming</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Postgres WAL & MySQL binlogs compressed with Zstandard and streamed directly into S3 multipart uploads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] font-mono text-[10px] text-emerald-400">
              RPO &lt; 3 Seconds
            </div>
          </div>

          <div className="surface-card p-6 flex flex-col justify-between">
            <div className="bevel-top" />
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Second-Precision PITR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Restore database state to any historical second. Recovers instantly from accidental DROP or DELETE
                statements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] font-mono text-[10px] text-amber-400">
              Microsecond Timeline Pinning
            </div>
          </div>

          <div className="surface-card p-6 flex flex-col justify-between">
            <div className="bevel-top" />
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Low-Overhead Daemon</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Engineered in memory-safe Rust with zero GC pauses. Consumes less than 15MB RAM on the database host.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] font-mono text-[10px] text-rose-400">
              &lt; 15 MB RAM Footprint
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Terminal Sandbox */}
      <TerminalSandbox />

      {/* Interactive System Topology */}
      <ArchitectureDiagram />

      {/* Interactive Cost Savings Calculator */}
      <CostCalculator />

      {/* Interactive Disaster Simulation Lab */}
      <PitrSimulator />

      {/* Quickstart Tabs & IAM Setup */}
      <QuickstartTabs />

      {/* Complete CLI Reference */}
      <CliReference />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Technical FAQ */}
      <FaqSection />

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 my-20">
        <div className="surface-card p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-b from-indigo-950/30 to-[#07080a]">
          <div className="bevel-top" />
          <div className="accent-glow-top" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Own Your Database Infrastructure
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Install VaultEngine on your EC2 host in 60 seconds. Start streaming transactions directly to Amazon S3 with zero
            cloud markups.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('quickstart')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] border border-indigo-400/30"
            >
              <Terminal className="w-4 h-4" />
              <span>Install VaultEngine</span>
            </button>
            <button
              onClick={() => scrollTo('docs')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 transition-colors border border-white/[0.08]"
            >
              <span>Explore Commands</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Production Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050608] py-12 px-4 text-center text-xs text-zinc-500 font-mono">
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
