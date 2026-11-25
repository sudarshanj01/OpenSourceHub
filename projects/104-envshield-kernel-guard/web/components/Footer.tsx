'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Github, ArrowUpRight, Copy, Check, Terminal, Globe, Heart } from 'lucide-react';

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -sSL https://shield.opensourcehub.dpdns.org/install.sh | bash';

  const copyCmd = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative bg-[#14110f] border-t border-[#ef9846]/15 pt-20 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#ef9846]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-6 relative">
        {/* Grand CTA Banner */}
        <div className="rounded-3xl border border-[#ef9846]/30 bg-gradient-to-b from-[#201b17] to-[#1a1613] p-8 sm:p-14 text-center relative overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] mb-20">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ef9846] to-transparent" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/25 text-[#ef9846] text-xs font-mono uppercase tracking-wider mb-6">
            <Shield className="w-3.5 h-3.5" />
            Sovereign Secret Vault
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#fbfbf9] tracking-tight max-w-2xl mx-auto mb-4 leading-tight">
            Build with AI fearlessly. Keep your keys locked in RAM.
          </h2>

          <p className="text-[#cfb8a2] text-sm sm:text-base max-w-xl mx-auto mb-8 font-sans leading-relaxed">
            Eliminate plaintext <code className="text-[#fbfbf9] font-mono">.env</code> leakage forever. Zero telemetry, zero cloud backdoors, zero root requirements.
          </p>

          {/* Inline Quick Install */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#14110f] border border-[#ef9846]/30 shadow-inner font-mono text-xs text-[#fbfbf9]">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <span className="text-[#ef9846] select-none">$</span>
                <span className="whitespace-nowrap">{installCmd}</span>
              </div>
              <button
                onClick={copyCmd}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef9846] hover:bg-[#f8a85a] text-[#14110f] font-semibold text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#install"
              className="px-6 py-3 rounded-xl bg-[#ef9846] hover:bg-[#f8a85a] text-[#14110f] font-semibold text-sm transition-all shadow-[0_0_25px_-5px_rgba(239,152,70,0.5)] flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              Get Started Now
            </a>
            <a
              href="https://github.com/sudarshanj01/OpenSourceHub/tree/main/projects/104-envshield-kernel-guard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-[#201b17] hover:bg-[#28221d] border border-[#ef9846]/25 text-[#fbfbf9] font-medium text-sm transition-all flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
              <ArrowUpRight className="w-4 h-4 text-[#8e7a68]" />
            </a>
          </div>
        </div>

        {/* Footer Navigation & Credits */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#ef9846]/10">
          {/* Col 1: Brand & Domain */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Shield Logo"
                className="w-8 h-8 rounded-lg object-cover border border-[#ef9846]/30"
              />
              <span className="font-display font-bold text-xl text-[#fbfbf9] tracking-tight">
                Shield
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/25 text-[10px] font-mono">
                v0.3.0
              </span>
            </div>
            <p className="text-xs text-[#a89785] max-w-sm leading-relaxed">
              Open-source zero-trust secret isolation for agentic software workflows. Protects developer secrets from untrusted LLMs, agents, and rogue supply chains.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1a1613] border border-[#ef9846]/20 text-xs font-mono text-[#cfb8a2]">
              <Globe className="w-3.5 h-3.5 text-[#ef9846]" />
              <span>Domain:</span>
              <a
                href="https://shield.opensourcehub.dpdns.org"
                target="_blank"
                rel="noreferrer"
                className="text-[#ef9846] hover:underline"
              >
                shield.opensourcehub.dpdns.org
              </a>
            </div>
          </div>

          {/* Col 2: Commands */}
          <div>
            <div className="font-display font-semibold text-xs uppercase tracking-wider text-[#fbfbf9] mb-3">
              Core CLI
            </div>
            <ul className="space-y-2 text-xs font-mono text-[#a89785]">
              <li><code className="text-[#cfb8a2]">shield seal</code> - Encrypt & shred .env</li>
              <li><code className="text-[#cfb8a2]">shield &lt;cmd&gt;</code> - Execute with RAM secrets</li>
              <li><code className="text-[#cfb8a2]">shield edit</code> - Ephemeral RAM editor</li>
              <li><code className="text-[#cfb8a2]">shield view</code> - Print decrypted variables</li>
              <li><code className="text-[#cfb8a2]">shield unseal</code> - Restore original file</li>
            </ul>
          </div>

          {/* Col 3: Links */}
          <div>
            <div className="font-display font-semibold text-xs uppercase tracking-wider text-[#fbfbf9] mb-3">
              Project & Resources
            </div>
            <ul className="space-y-2 text-xs text-[#a89785]">
              <li>
                <Link href="/doc" className="hover:text-[#ef9846] transition-colors">
                  CLI Documentation
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#ef9846] transition-colors">
                  Zero-Disk Quarantine
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-[#ef9846] transition-colors">
                  Cryptographic Design
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/sudarshanj01/OpenSourceHub/tree/main/projects/104-envshield-kernel-guard"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#ef9846] transition-colors flex items-center gap-1"
                >
                  GitHub Repository
                  <ArrowUpRight className="w-3 h-3 text-[#8e7a68]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e7a68]">
          <div>
            &copy; {new Date().getFullYear()} Shield (OpenSourceHub). Released under Apache-2.0 & MIT License.
          </div>
          <div className="flex items-center gap-1">
            <span>Built for the open-source agentic community with</span>
            <Heart className="w-3 h-3 text-[#ef9846] fill-[#ef9846]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
