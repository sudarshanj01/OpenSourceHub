'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Copy, Check, ArrowRight } from 'lucide-react';

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
    } catch {
      // clipboard access fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-orac-mesh radial-copper-glow">
      <div className="max-w-[1040px] mx-auto px-6 relative z-10">
        {/* Eyebrow Badge */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/30 text-[#ef9846] text-xs font-medium tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 fill-[#ef9846]/30" />
            <span>Zero-Disk Secret Isolation</span>
          </div>
        </div>

        {/* Grand Headline */}
        <div className="max-w-4xl text-center md:text-left space-y-5 mb-10">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#fbfbf9] leading-[1.1]">
            You give your agent access to your project folder and your agent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef9846] via-[#f8cba2] to-[#ef9846]">
              reads .env file.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#cfb8a2] font-normal max-w-2xl leading-relaxed">
            This is how <span className="text-[#fbfbf9] font-medium">Shield</span> solves it: plaintext{' '}
            <code className="text-[#f8cba2] font-mono text-sm">.env</code> is encrypted and shredded from disk, and injected only into RAM when your app runs.
          </p>
        </div>

        {/* 1-Line Universal Installer Box */}
        <div id="install" className="max-w-2xl scroll-mt-28">
          <div className="bg-[#1b1714]/90 border border-[#ef9846]/25 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl relative">
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

              <Link
                href="/doc"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-[#ef9846] hover:underline"
              >
                Read Docs <ArrowRight className="w-3 h-3" />
              </Link>
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
          </div>
        </div>
      </div>
    </section>
  );
}
