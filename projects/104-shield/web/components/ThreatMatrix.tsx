'use client';

import React from 'react';
import { ShieldCheck, ShieldX, AlertTriangle, Lock, Eye, Zap, Check, X } from 'lucide-react';

const MATRIX_DATA = [
  {
    vector: 'AI Coding Agent shell read (cat .env, python dump)',
    plaintext: { text: 'Plaintext leaked directly to context window', safe: false },
    dotenvx: { text: 'Requires key in plaintext CLI or env flag', safe: false },
    cursorignore: { text: 'Bypassed trivially via any shell tool call', safe: false },
    shield: { text: 'Blocked. .env does not exist on disk', safe: true, highlight: 'Zero plaintext on disk' },
  },
  {
    vector: 'Accidental Git commit & push (git add .)',
    plaintext: { text: 'Pushed to public/private remote repos', safe: false },
    dotenvx: { text: 'Only encrypted ciphertext committed', safe: true },
    cursorignore: { text: 'Still committed by Git CLI', safe: false },
    shield: { text: '.env is shredded. .env.vault ciphertext is safe', safe: true, highlight: 'Pre-commit immunity' },
  },
  {
    vector: 'Process RAM inspection / Core dump exfiltration',
    plaintext: { text: 'Readable via /proc/$PID/environ', safe: false },
    dotenvx: { text: 'Exposed to any ptrace attachment', safe: false },
    cursorignore: { text: 'No protection', safe: false },
    shield: { text: 'PR_SET_DUMPABLE=0 disables ptrace & memory read', safe: true, highlight: 'OS-level dump lock' },
  },
  {
    vector: 'Subprocess Execution (shield npm run dev)',
    plaintext: { text: 'Must leave raw file on disk indefinitely', safe: false },
    dotenvx: { text: 'Complex dotenvx run -- syntax', safe: false },
    cursorignore: { text: 'No runtime management', safe: false },
    shield: { text: 'Direct command prefix: shield <any_cmd>', safe: true, highlight: 'Seamless in-RAM inject' },
  },
  {
    vector: 'Secrets Stored in Agent Context / Chat Logs',
    plaintext: { text: 'Saved in LLM prompt logs & vendor cache', safe: false },
    dotenvx: { text: 'Leaked if command prints env vars', safe: false },
    cursorignore: { text: 'Vulnerable', safe: false },
    shield: { text: 'Never read into agent prompt context', safe: true, highlight: 'Zero agent exposure' },
  },
  {
    vector: 'Requires Root Privileges or Kernel Modules',
    plaintext: { text: 'No', safe: true },
    dotenvx: { text: 'No', safe: true },
    cursorignore: { text: 'No', safe: true },
    shield: { text: '100% User-space. Zero root, zero kernel hazard', safe: true, highlight: 'Zero-privilege safe' },
  },
];

export default function ThreatMatrix() {
  return (
    <section id="matrix" className="py-24 relative">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/25 text-[#ef9846] text-xs font-mono uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5" />
            Threat Vector Breakdown
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#fbfbf9] tracking-tight mb-4">
            Why traditional safeguards fail against AI agents.
          </h2>
          <p className="text-[#cfb8a2] text-base leading-relaxed">
            AI agents like Claude Code, Cursor, Codex, and OpenDevin run with your exact shell UID. File permissions, ignore lists, and convention-based protection are immediately bypassed.
          </p>
        </div>

        {/* Matrix Card */}
        <div className="rounded-2xl border border-[#ef9846]/20 bg-[#1a1613]/90 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#ef9846]/15 bg-[#201b17]/80">
                  <th className="py-4 px-5 text-[#fbfbf9] font-display font-semibold w-2/5">
                    Attack Surface / Scenario
                  </th>
                  <th className="py-4 px-4 text-[#8e7a68] font-mono hidden md:table-cell">
                    Raw .env
                  </th>
                  <th className="py-4 px-4 text-[#8e7a68] font-mono hidden lg:table-cell">
                    .cursorignore
                  </th>
                  <th className="py-4 px-4 text-[#8e7a68] font-mono hidden sm:table-cell">
                    dotenvx
                  </th>
                  <th className="py-4 px-5 text-[#ef9846] font-display font-bold bg-[#ef9846]/10 border-l border-[#ef9846]/20">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#ef9846]" />
                      Shield
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ef9846]/10 font-sans">
                {MATRIX_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#201b17]/40 transition-colors">
                    {/* Threat vector */}
                    <td className="py-4 px-5 text-[#fbfbf9] font-medium align-top">
                      {row.vector}
                    </td>

                    {/* Raw env */}
                    <td className="py-4 px-4 text-[#8e7a68] align-top hidden md:table-cell">
                      <div className="flex items-start gap-1.5">
                        {row.plaintext.safe ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                        )}
                        <span className={row.plaintext.safe ? 'text-[#cfb8a2]' : 'text-red-300/80'}>
                          {row.plaintext.text}
                        </span>
                      </div>
                    </td>

                    {/* Cursorignore */}
                    <td className="py-4 px-4 text-[#8e7a68] align-top hidden lg:table-cell">
                      <div className="flex items-start gap-1.5">
                        {row.cursorignore.safe ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                        )}
                        <span className={row.cursorignore.safe ? 'text-[#cfb8a2]' : 'text-red-300/80'}>
                          {row.cursorignore.text}
                        </span>
                      </div>
                    </td>

                    {/* dotenvx */}
                    <td className="py-4 px-4 text-[#8e7a68] align-top hidden sm:table-cell">
                      <div className="flex items-start gap-1.5">
                        {row.dotenvx.safe ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                        )}
                        <span className={row.dotenvx.safe ? 'text-[#cfb8a2]' : 'text-[#a89785]'}>
                          {row.dotenvx.text}
                        </span>
                      </div>
                    </td>

                    {/* Shield */}
                    <td className="py-4 px-5 bg-[#ef9846]/[0.04] border-l border-[#ef9846]/20 align-top">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#ef9846] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[#fbfbf9] font-medium">
                            {row.shield.text}
                          </div>
                          <span className="inline-block mt-1 text-[11px] font-mono text-[#ef9846] bg-[#ef9846]/10 px-1.5 py-0.5 rounded border border-[#ef9846]/20">
                            {row.shield.highlight}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
