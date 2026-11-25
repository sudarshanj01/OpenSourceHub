'use client';

import React from 'react';
import { Lock, KeyRound, Cpu, ShieldAlert, FileKey2, Terminal, CheckCircle2 } from 'lucide-react';

const SPECS = [
  {
    icon: KeyRound,
    title: 'Argon2id Key Derivation',
    tag: 'Memory-Hard KDF',
    description:
      'Derives an ephemeral 256-bit symmetric key from your master password using 64MB memory cost, 3 iterations, and 4 parallelism lanes. Defeats GPU/ASIC dictionary attacks.',
    code: 'argon2id(m=65536, t=3, p=4, salt=16B)',
  },
  {
    icon: Lock,
    title: 'AES-256-GCM AEAD',
    tag: 'Authenticated Encryption',
    description:
      'Military-grade 256-bit Galois/Counter Mode encryption. Every seal generates a fresh 96-bit cryptographically secure CSPRNG nonce with an inviolable 128-bit authentication tag.',
    code: 'aes_256_gcm(key, nonce_96, tag_128)',
  },
  {
    icon: Cpu,
    title: 'PR_SET_DUMPABLE Memory Guard',
    tag: 'Kernel Anti-Snoop',
    description:
      'When spawning your target process, Shield disables process memory dumpability via Linux prctl. Rogue processes and agents cannot attach via ptrace or read /proc/$PID/mem.',
    code: 'prctl(PR_SET_DUMPABLE, 0)',
  },
  {
    icon: FileKey2,
    title: 'Volatile In-RAM Lifecycle',
    tag: 'Zero-Disk Lifetime',
    description:
      'Plaintext secrets exist exclusively in process RAM for the exact duration of the command. Master password is wiped from registers and never touched by disk or swap.',
    code: 'zeroize::Zeroize::zeroize(&mut pass)',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24 relative bg-[#14110f]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#ef9846]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/25 text-[#ef9846] text-xs font-mono uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5" />
            Zero-Trust Architecture
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#fbfbf9] tracking-tight mb-4">
            Provably secure by cryptographic design.
          </h2>
          <p className="text-[#cfb8a2] text-base leading-relaxed">
            Engineered in 100% safe Rust. No root privileges, no kernel driver instability, and zero master keys stored anywhere on your system.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPECS.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-[#1a1613] border border-[#ef9846]/15 hover:border-[#ef9846]/40 transition-all duration-300 relative overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                {/* Top border accent line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ef9846]/40 to-transparent group-hover:via-[#ef9846] transition-all duration-500" />

                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#201b17] border border-[#ef9846]/30 flex items-center justify-center text-[#ef9846] shadow-[0_0_20px_-3px_rgba(239,152,70,0.25)] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-[#ef9846] bg-[#ef9846]/10 px-2.5 py-1 rounded-full border border-[#ef9846]/20">
                    {spec.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-[#fbfbf9] mb-2 group-hover:text-[#ef9846] transition-colors">
                  {spec.title}
                </h3>
                <p className="text-sm text-[#cfb8a2] leading-relaxed mb-6 font-sans">
                  {spec.description}
                </p>

                <div className="bg-[#14110f] border border-[#ef9846]/15 rounded-lg px-3.5 py-2 font-mono text-xs text-[#f8cba2] flex items-center justify-between">
                  <span>{spec.code}</span>
                  <span className="w-2 h-2 rounded-full bg-[#ef9846]/60 animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Callout banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#1a1613]/60 border border-[#ef9846]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#fbfbf9]">
                User-Space Verified Isolation
              </div>
              <div className="text-xs text-[#a89785]">
                Runs cleanly on macOS (Darwin), Linux (glibc & musl), and Windows (NT 10+). Zero kernel panic or system freeze risk.
              </div>
            </div>
          </div>
          <a
            href="#install"
            className="px-5 py-2.5 rounded-xl bg-[#ef9846] hover:bg-[#f8a85a] text-[#14110f] font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_-3px_rgba(239,152,70,0.4)] whitespace-nowrap"
          >
            Deploy Shield v0.3.0
          </a>
        </div>
      </div>
    </section>
  );
}
