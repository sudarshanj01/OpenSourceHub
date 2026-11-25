'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Cpu, ShieldCheck, ArrowUpRight } from 'lucide-react';

const STEPS = [
  {
    icon: Lock,
    step: '01',
    title: 'Plaintext Shredded from Disk',
    cmd: 'shield seal',
    desc: 'Encrypts .env into .env.vault with Argon2id + AES-256-GCM and wipes the original file. AI agents find zero secrets.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'Injected Only Into RAM',
    cmd: 'shield npm run dev',
    desc: 'Decrypts secrets in memory and passes them straight to your app. No temporary files ever touch your SSD.',
  },
  {
    icon: ShieldCheck,
    step: '03',
    title: 'Zero Root. Memory Locked.',
    cmd: 'PR_SET_DUMPABLE=0',
    desc: 'Runs 100% in user-space across Linux, macOS, and Windows while blocking ptrace and /proc/$PID/mem snooping.',
  },
];

export default function HowItSolves() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 border-t border-[#ef9846]/10 bg-[#14110f]">
      <div className="max-w-[1040px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#ef9846] mb-2">
              How Shield Solves It
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#fbfbf9] tracking-tight">
              Three steps to agent-proof secrets.
            </h2>
          </div>
          <Link
            href="/doc"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#ef9846] hover:underline shrink-0"
          >
            Full CLI Reference <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-[#1a1613] border border-[#ef9846]/15 hover:border-[#ef9846]/35 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#201b17] border border-[#ef9846]/25 flex items-center justify-center text-[#ef9846]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs text-[#8e7a68]">{item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#fbfbf9] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#cfb8a2] leading-relaxed mb-5">
                    {item.desc}
                  </p>
                </div>
                <div className="bg-[#14110f] border border-white/5 rounded-lg px-3 py-2 font-mono text-[11px] text-[#f8cba2]">
                  $ {item.cmd}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
