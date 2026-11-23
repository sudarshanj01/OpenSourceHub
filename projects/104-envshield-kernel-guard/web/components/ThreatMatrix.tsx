'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

const THREATS = [
  {
    vector: 'AI Agent Shell Execution (cat .env, python, bash)',
    standard: 'Leaked immediately (agent has developer UID permissions)',
    envshield: 'Paused in kernel. Desktop prompt demands Master Password.',
    blocked: true,
  },
  {
    vector: 'Agent Memory / Context Window Indexing (Cursor, IDEs)',
    standard: 'Silently read & embedded into vector databases',
    envshield: 'EACCES Permission Denied sent to indexing worker',
    blocked: true,
  },
  {
    vector: 'Malicious npm/pip Supply Chain Dependency Exfiltration',
    standard: 'Full network exfiltration to external C2 server',
    envshield: 'Synchronously halted. Modal shows PID, command line & target',
    blocked: true,
  },
  {
    vector: 'Agent executing kill -9 on the Guarding Daemon',
    standard: 'N/A (No guard present)',
    envshield: 'Impossible: EnvShield runs as root systemd service. User UID cannot kill root.',
    blocked: true,
  },
  {
    vector: 'Accidental Git Staging & Push (git add .env && git commit)',
    standard: 'Committed to repository and pushed to GitHub',
    envshield: 'git process is blocked from reading .env during hash-object staging',
    blocked: true,
  },
  {
    vector: 'System-Wide Coverage (Zero Project-Level Setup Required)',
    standard: 'Requires per-project .gitignore / .dockerignore',
    envshield: 'Mount-level fanotify covers all current & future .env files globally',
    blocked: true,
  },
];

export default function ThreatMatrix() {
  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 lg:p-8 backdrop-blur-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          The AI Era Threat Surface vs. EnvShield
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Why traditional file permissions (chmod 600) completely fail when AI coding agents share your user ID.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-3 px-4 font-semibold">Attack / Access Vector</th>
              <th className="py-3 px-4 font-semibold text-red-400">Standard Linux Dev Machine</th>
              <th className="py-3 px-4 font-semibold text-emerald-400">With EnvShield Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {THREATS.map((t, i) => (
              <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-zinc-200">{t.vector}</td>
                <td className="py-3.5 px-4 text-zinc-400 flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{t.standard}</span>
                </td>
                <td className="py-3.5 px-4 text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 font-medium">{t.envshield}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
