'use client';

import React, { useState } from 'react';
import { Shield, Terminal, Copy, Check, Lock, Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

const INSTALL_COMMANDS = {
  unix: 'curl -sSL https://shield.opensourcehub.dpdns.org/install.sh | bash',
  powershell: 'irm https://shield.opensourcehub.dpdns.org/install.ps1 | iex',
  cargo: 'cargo install --git https://github.com/sudarshanj01/OpenSourceHub shield',
};

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'unix' | 'powershell' | 'cargo'>('unix');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(INSTALL_COMMANDS[activeTab]);
      }
    } catch (e) {
      // clipboard access fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-orac-mesh radial-copper-glow">
      <div className="max-w-[1160px] mx-auto px-6 relative z-10">
        {/* Eyebrow Badge */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/30 text-[#ef9846] text-xs font-medium tracking-wider uppercase shadow-[0_0_20px_-3px_rgba(239,152,70,0.3)]">
            <Shield className="w-3.5 h-3.5 fill-[#ef9846]/30" />
            <span>Agentic Secrecy • Zero-Knowledge DLP</span>
          </div>
        </div>

        {/* Grand Headline (Oraczen Style) */}
        <div className="max-w-4xl text-center md:text-left space-y-4 mb-8">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#fbfbf9] leading-[1.08]">
            The future of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef9846] via-[#f8cba2] to-[#ef9846]">
              secret sovereignty
            </span> <br />
            is agent-proof.
          </h1>

          <p className="text-lg sm:text-xl text-[#cfb8a2] font-normal max-w-2xl leading-relaxed pt-2">
            AI coding agents (Claude Code, Cursor, Aider) run in your repositories. 
            <span className="text-[#fbfbf9] font-medium"> Secrets stay sealed in memory.</span> No plaintext on disk. No tokens in prompt context. Zero cloud lock-in.
          </p>
        </div>

        {/* 1-Line Universal Installer Box */}
        <div id="install" className="max-w-2xl scroll-mt-28 mb-16">
          <div className="bg-[#1b1714]/90 border border-[#ef9846]/25 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl relative group">
            {/* Ambient copper border accent */}
            <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#ef9846]/60 to-transparent opacity-80" />

            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-1.5 bg-[#14110f] p-1 rounded-lg border border-white/5 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('unix')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'unix' 
                      ? 'bg-[#ef9846] text-[#14110f] font-bold shadow-sm' 
                      : 'text-[#a89785] hover:text-[#fbfbf9]'
                  }`}
                >
                  Linux / macOS
                </button>
                <button
                  onClick={() => setActiveTab('powershell')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'powershell' 
                      ? 'bg-[#ef9846] text-[#14110f] font-bold shadow-sm' 
                      : 'text-[#a89785] hover:text-[#fbfbf9]'
                  }`}
                >
                  Windows
                </button>
                <button
                  onClick={() => setActiveTab('cargo')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'cargo' 
                      ? 'bg-[#ef9846] text-[#14110f] font-bold shadow-sm' 
                      : 'text-[#a89785] hover:text-[#fbfbf9]'
                  }`}
                >
                  Cargo
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#a89785]">
                <span className="hidden sm:inline">Zero root required</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#14110f] rounded-xl px-4 py-3 border border-white/5 font-mono text-xs text-[#f8cba2]">
              <div className="flex items-center gap-2.5 overflow-x-auto truncate">
                <span className="text-[#ef9846] select-none font-bold">$</span>
                <span className="truncate">{INSTALL_COMMANDS[activeTab]}</span>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#28221d] hover:bg-[#ef9846] text-[#cfb8a2] hover:text-[#14110f] transition-all flex items-center gap-1.5 font-sans font-semibold text-xs"
                title="Copy command"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#8c7866] font-mono px-1">
              <span>Single static binary &lt; 5MB</span>
              <span>Argon2id + AES-256-GCM authenticated</span>
            </div>
          </div>
        </div>

        {/* 3 Value Anchor Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
          <div className="bg-[#1a1613]/80 border border-[#ef9846]/15 hover:border-[#ef9846]/35 rounded-2xl p-5 transition-all">
            <div className="font-mono text-xs text-[#a89785] uppercase tracking-wider mb-1">
              Storage Surface
            </div>
            <div className="font-display text-3xl font-bold text-[#fbfbf9] flex items-baseline gap-1.5">
              0 <span className="text-[#ef9846] text-lg font-sans">Bytes</span>
            </div>
            <p className="text-xs text-[#cfb8a2] mt-2 leading-relaxed">
              Plaintext <code className="text-[#f8cba2]">.env</code> is physically shredded upon seal. AI agents searching for credentials find nothing.
            </p>
          </div>

          <div className="bg-[#1a1613]/80 border border-[#ef9846]/15 hover:border-[#ef9846]/35 rounded-2xl p-5 transition-all">
            <div className="font-mono text-xs text-[#a89785] uppercase tracking-wider mb-1">
              Runtime Delivery
            </div>
            <div className="font-display text-3xl font-bold text-[#fbfbf9] flex items-baseline gap-1.5">
              100 <span className="text-[#ef9846] text-lg font-sans">% RAM</span>
            </div>
            <p className="text-xs text-[#cfb8a2] mt-2 leading-relaxed">
              Secrets are injected directly into child process memory. Zero temporary files on SSD.
            </p>
          </div>

          <div className="bg-[#1a1613]/80 border border-[#ef9846]/15 hover:border-[#ef9846]/35 rounded-2xl p-5 transition-all">
            <div className="font-mono text-xs text-[#a89785] uppercase tracking-wider mb-1">
              Architecture
            </div>
            <div className="font-display text-3xl font-bold text-[#fbfbf9] flex items-baseline gap-1.5">
              Zero <span className="text-[#ef9846] text-lg font-sans">Root</span>
            </div>
            <p className="text-xs text-[#cfb8a2] mt-2 leading-relaxed">
              Pure user-space cryptography. Zero kernel crash risks. Works identically on Linux, macOS, and Windows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
