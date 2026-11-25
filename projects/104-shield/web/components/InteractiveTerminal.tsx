'use client';

import React, { useState } from 'react';
import { Terminal, Play, Lock, ShieldCheck, ShieldAlert, Check, RefreshCw } from 'lucide-react';

interface TerminalScenario {
  id: string;
  label: string;
  command: string;
  description: string;
}

const SCENARIOS: TerminalScenario[] = [
  {
    id: 'agent-cat',
    label: 'AI Agent Tries: cat .env',
    command: 'cat .env',
    description: 'Simulates Claude Code or Cursor attempting to inspect secrets.',
  },
  {
    id: 'shield-run',
    label: 'Developer Runs: shield npm run dev',
    command: 'shield npm run dev',
    description: 'Runs Next.js with environment variables injected only in RAM.',
  },
  {
    id: 'shield-edit',
    label: 'Developer Edits: shield edit',
    command: 'shield edit',
    description: 'Safely edits secrets inside temporary RAM memory.',
  },
  {
    id: 'shield-cat',
    label: 'Developer Views: shield cat .env',
    command: 'shield cat .env',
    description: 'Safely outputs decrypted secrets to stdout in memory.',
  },
  {
    id: 'shield-status',
    label: 'Inspect: shield status',
    command: 'shield status',
    description: 'Checks repository protection state.',
  },
];

export default function InteractiveTerminal() {
  const [activeScenario, setActiveScenario] = useState<TerminalScenario>(SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '# Shield v0.3.0 Terminal Simulator',
    '# Click any scenario tab below to simulate execution in real time.',
  ]);

  const handleRun = (scenario: TerminalScenario) => {
    setActiveScenario(scenario);
    setIsRunning(true);

    if (scenario.id === 'agent-cat') {
      setTerminalLogs([
        '$ cat .env',
        'cat: .env: No such file or directory',
        '',
        '[Agent Verdict] 0 bytes leaked. The plaintext .env does not exist on disk.',
        '[Safety Audit]  Zero credentials entered prompt context or LLM telemetry.',
      ]);
      setIsRunning(false);
    } else if (scenario.id === 'shield-run') {
      setTerminalLogs([
        '$ shield npm run dev',
        'Enter Master Password: [••••••••••••]',
        '⚡ Injected 5 environment variables into RAM for: npm run dev',
        '[Linux Shield] Applied PR_SET_DUMPABLE=0 (blocks /proc/environ inspection)',
        '',
        '> fintech-app@0.1.0 dev',
        '> next dev -p 3000',
        '',
        '   ▲ Next.js 16.4 (Turbopack)',
        '   - Local:        http://localhost:3000',
        '   - Environment:  .env.vault (RAM Decrypted)',
        '   ✓ Ready in 640ms',
        '',
        '[Status] Server active. Plaintext was NEVER written to SSD.',
      ]);
      setIsRunning(false);
    } else if (scenario.id === 'shield-edit') {
      setTerminalLogs([
        '$ shield edit',
        'Enter Master Password: [••••••••••••]',
        '⏳ Decrypting secrets into /dev/shm temporary RAM buffer...',
        '⏳ Opening editor nano in RAM...',
        '[Editor] User updated STRIPE_SECRET_KEY, saved and exited.',
        '⏳ Re-encrypting secrets with fresh salt & nonce (Argon2id + AES-256-GCM)...',
        '⏳ Securely shredding temporary RAM buffer...',
        '✓ Vault \'.env.vault\' updated successfully in RAM.',
      ]);
      setIsRunning(false);
    } else if (scenario.id === 'shield-cat') {
      setTerminalLogs([
        '$ shield cat .env',
        'Enter Master Password: [••••••••••••]',
        '────────────────────────────────────────────────────────────',
        '🔒 [RAM ONLY] Decrypted .env contents:',
        '────────────────────────────────────────────────────────────',
        'DATABASE_URL="postgres://app:prod_pwd_99@db:5432/main"',
        'STRIPE_SECRET_KEY="sk_live_51M0...98x"',
        'OPENAI_API_KEY="sk-proj-9922...aa1"',
        '────────────────────────────────────────────────────────────',
        '(Displayed in stdout. ZERO files created on disk)',
      ]);
      setIsRunning(false);
    } else if (scenario.id === 'shield-status') {
      setTerminalLogs([
        '$ shield status',
        '============================================================',
        '   🔒 Shield — Repository Secret Protection Status',
        '============================================================',
        'Repository Status: SEALED & PROTECTED (AI-Agent Safe)',
        'Vault File:        .env.vault (AES-256-GCM + Argon2id)',
        'Plaintext on Disk: NONE (Shredded)',
        '',
        'AI Agents (Claude Code, Cursor) searching for .env will find nothing.',
      ]);
      setIsRunning(false);
    }
  };

  return (
    <section id="demo" className="py-20 max-w-[1160px] mx-auto px-6 scroll-mt-24">
      <div className="bg-[#181411]/90 border border-[#ef9846]/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Accent glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ef9846] to-transparent opacity-75" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/30 text-[#ef9846] text-xs font-mono mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Interactive Testbed
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#fbfbf9] tracking-tight">
              Test the AI Agent Defense
            </h2>
            <p className="text-sm text-[#cfb8a2] mt-1">
              Select a command scenario to see how Shield behaves in terminal execution.
            </p>
          </div>
        </div>

        {/* Scenarios Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6">
          {SCENARIOS.map((sc) => {
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleRun(sc)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#28221d] border-[#ef9846] text-[#fbfbf9] shadow-[0_0_15px_-3px_rgba(239,152,70,0.3)]'
                    : 'bg-[#14110f]/60 border-white/5 hover:border-white/15 text-[#a89785]'
                }`}
              >
                <div className="font-mono text-xs font-bold truncate mb-1 text-[#f8cba2]">
                  {sc.command}
                </div>
                <div className="text-[11px] text-[#cfb8a2] line-clamp-2 leading-relaxed">
                  {sc.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Terminal Window */}
        <div className="rounded-2xl bg-[#0f0c0a] border border-white/10 p-5 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-[#a89785] text-[11px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shrink-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
              <span className="ml-2 text-[#cfb8a2] font-semibold truncate text-[10px] sm:text-[11px]">shield@localhost:~/workspace</span>
            </div>
            <div className="text-[#8c7866] text-[10px] shrink-0 hidden sm:block">
              Interactive Shell Simulation
            </div>
          </div>

          <div className="space-y-1.5 min-h-[220px] max-h-[340px] overflow-y-auto pr-2">
            {terminalLogs.map((log, i) => {
              let color = 'text-[#cfb8a2]';
              if (log.startsWith('$')) color = 'text-[#ef9846] font-bold text-sm';
              if (log.includes('No such file or directory')) color = 'text-red-400 font-bold';
              if (log.includes('Injected') || log.includes('Ready') || log.includes('✓')) color = 'text-emerald-400 font-bold';
              if (log.includes('[Agent Verdict]') || log.includes('[Safety Audit]')) color = 'text-[#f8cba2]';
              if (log.includes('DATABASE_URL') || log.includes('STRIPE_SECRET_KEY')) color = 'text-[#fbfbf9] bg-[#1a1613] px-2 py-0.5 rounded';

              return (
                <div key={i} className={`${color} leading-relaxed`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
