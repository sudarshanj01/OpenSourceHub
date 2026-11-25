'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Terminal, Cpu, FileLock2, Play, Edit3, EyeOff, Zap, CheckCircle2 } from 'lucide-react';

export default function TwoPillars() {
  return (
    <section id="how-it-works" className="py-24 max-w-[1160px] mx-auto px-6 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center md:text-left max-w-2xl mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/30 text-[#ef9846] text-xs font-mono font-medium mb-3">
          TWO SIDES OF SECRET SOVEREIGNTY
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#fbfbf9] tracking-tight">
          Total defense for agents. <br />
          <span className="text-[#ef9846]">Zero friction for you.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#cfb8a2] mt-3 leading-relaxed">
          Shield splits secret management into two uncompromising halves: mathematically locking out AI agents while keeping your terminal workflow instantaneous.
        </p>
      </div>

      {/* The Two Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pillar 1: The Agent Defense */}
        <div className="bg-[#181411]/90 border border-[#ef9846]/20 hover:border-[#ef9846]/45 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#ef9846]/10 to-transparent blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#241f1a] border border-[#ef9846]/30 flex items-center justify-center text-[#ef9846] shadow-[0_0_20px_-3px_rgba(239,152,70,0.3)]">
                <FileLock2 className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/20 font-semibold">
                Pillar I • Defense
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-[#fbfbf9] mb-3">
              The Agent Quarantine
            </h3>
            <p className="text-sm text-[#cfb8a2] leading-relaxed mb-6">
              Plaintext <code className="text-[#f8cba2]">.env</code> files are the #1 source of AI credential leaks. When you run <code className="text-[#ef9846] font-semibold">shield seal</code>, Shield converts your secrets into an uncrackable AES-256-GCM vault and shreds the original from your SSD.
            </p>

            {/* Bullet features */}
            <div className="space-y-3 font-mono text-xs text-[#cfb8a2] mb-6">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">Shreds disk plaintext:</strong> Overwritten with random noise and unlinked.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">Stops cat / grep / find:</strong> Autonomous agents receive instant <code className="text-red-400">No such file</code>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">Zero Keys on Disk:</strong> Unlike dotenvx, no <code className="text-red-300">.env.keys</code> is left for agents to steal.</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120f0d] border border-white/5 font-mono text-xs text-[#a89785]">
            <div className="text-[11px] text-[#ef9846] font-semibold mb-1">// What the AI Agent sees:</div>
            <div className="text-[#cfb8a2]">$ cat .env</div>
            <div className="text-red-400 font-semibold">cat: .env: No such file or directory</div>
          </div>
        </div>

        {/* Pillar 2: The Dev Experience */}
        <div className="bg-[#181411]/90 border border-[#ef9846]/20 hover:border-[#ef9846]/45 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#ef9846]/10 to-transparent blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#241f1a] border border-[#ef9846]/30 flex items-center justify-center text-[#ef9846] shadow-[0_0_20px_-3px_rgba(239,152,70,0.3)]">
                <Play className="w-6 h-6 fill-[#ef9846]/20" />
              </div>
              <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/20 font-semibold">
                Pillar II • Execution
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-[#fbfbf9] mb-3">
              The Seamless Runner
            </h3>
            <p className="text-sm text-[#cfb8a2] leading-relaxed mb-6">
              No complex SDKs or code changes. Simply prefix any command with <code className="text-[#ef9846] font-semibold">shield</code>. Shield prompts for your Master Password once and injects secrets directly into process RAM.
            </p>

            {/* Bullet features */}
            <div className="space-y-3 font-mono text-xs text-[#cfb8a2] mb-6">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">Zero-Friction Prefix:</strong> Run <code className="text-[#f8cba2]">shield npm run dev</code>, <code className="text-[#f8cba2]">shield python</code>, <code className="text-[#f8cba2]">shield docker</code>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">In-Memory Editing:</strong> Run <code className="text-[#f8cba2]">shield edit</code> to open nano/vim in RAM; auto-encrypts on save.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                <span><strong className="text-[#fbfbf9]">Linux Anti-Snooping:</strong> Sets <code className="text-[#f8cba2]">PR_SET_DUMPABLE</code> to block /proc/environ inspection.</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120f0d] border border-white/5 font-mono text-xs text-[#a89785]">
            <div className="text-[11px] text-[#ef9846] font-semibold mb-1">// How you run your server:</div>
            <div className="text-[#cfb8a2]">$ shield npm run dev</div>
            <div className="text-emerald-400 font-semibold">⚡ Injected 8 secrets into RAM. Next.js ready at :3000</div>
          </div>
        </div>
      </div>
    </section>
  );
}
