'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, ShieldCheck, Play, Edit3, Eye, Unlock, Activity } from 'lucide-react';

const COMMANDS_LIST = [
  {
    id: 'seal',
    title: 'shield seal',
    tag: 'One-Time Setup',
    icon: ShieldCheck,
    desc: 'Encrypts your plaintext .env into an AES-256-GCM vault (.env.vault) and permanently shreds the plaintext from disk. Automatically appends .env to .gitignore.',
    example: '$ shield seal\n\n# Or seal custom files:\n$ shield seal --file .env.production',
  },
  {
    id: 'run',
    title: 'shield <command>',
    tag: 'Daily Workflow',
    icon: Play,
    desc: 'Runs any application or script with secrets decrypted in RAM only. Prefix any command: npm, pnpm, python, docker, cargo, bun, go.',
    example: '$ shield npm run dev\n$ shield python main.py\n$ shield docker compose up\n$ shield cargo run',
  },
  {
    id: 'edit',
    title: 'shield edit',
    tag: 'Secret Management',
    icon: Edit3,
    desc: 'Opens your editor (nano, vim, or $EDITOR) inside a temporary RAM-disk (/dev/shm). When you save and close, it re-encrypts with fresh salt and shreds the RAM file.',
    example: '$ shield edit\n\n# Or edit specific vault:\n$ shield edit --vault .env.production.vault',
  },
  {
    id: 'view',
    title: 'shield view',
    tag: 'Quick Inspection',
    icon: Eye,
    desc: 'Decrypts secrets in memory and prints them directly to terminal stdout. Never creates or touches any file on disk.',
    example: '$ shield view\n# Or safely cat in memory:\n$ shield cat .env',
  },
  {
    id: 'unseal',
    title: 'shield unseal',
    tag: 'Revert & Export',
    icon: Unlock,
    desc: 'Restores the plaintext .env from the encrypted vault after verifying your Master Password, and deletes .env.vault. Zero lock-in.',
    example: '$ shield unseal\n\n# Or unseal to custom file:\n$ shield unseal --output .env.restored',
  },
  {
    id: 'status',
    title: 'shield status',
    tag: 'Audit & Health',
    icon: Activity,
    desc: 'Audits the current directory to verify if secrets are SEALED (agent-safe), UNPROTECTED (vulnerable to agents), or out of sync.',
    example: '$ shield status',
  },
];

export default function CommandsGrid() {
  const [selectedCmd, setSelectedCmd] = useState(COMMANDS_LIST[1]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCmd.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="commands" className="py-20 max-w-[1160px] mx-auto px-6 scroll-mt-24">
      <div className="text-center md:text-left max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ef9846]/10 border border-[#ef9846]/30 text-[#ef9846] text-xs font-mono font-medium mb-3">
          CLI QUICK REFERENCE
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fbfbf9] tracking-tight">
          One binary. Six commands.
        </h2>
        <p className="text-sm text-[#cfb8a2] mt-2">
          Designed for muscle memory. No flags to memorize, no configuration files to manage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Command list */}
        <div className="lg:col-span-5 space-y-2.5">
          {COMMANDS_LIST.map((cmd) => {
            const isSelected = selectedCmd.id === cmd.id;
            const IconComponent = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => setSelectedCmd(cmd)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-[#221c17] border-[#ef9846] text-[#fbfbf9] shadow-lg'
                    : 'bg-[#181411]/60 border-white/5 hover:border-white/15 text-[#a89785]'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${
                  isSelected ? 'bg-[#ef9846] text-[#14110f]' : 'bg-[#241f1b] text-[#ef9846]'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-bold text-[#fbfbf9] truncate">
                      {cmd.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/20">
                      {cmd.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#cfb8a2] line-clamp-2 leading-relaxed">
                    {cmd.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Command code preview */}
        <div className="lg:col-span-7 bg-[#120f0d] border border-white/10 rounded-2xl p-6 font-mono text-xs flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-[#ef9846] font-bold text-sm">{selectedCmd.title}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241f1a] hover:bg-[#ef9846] text-[#cfb8a2] hover:text-[#14110f] transition-all font-sans font-semibold text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-sm font-sans text-[#cfb8a2] leading-relaxed mb-6">
              {selectedCmd.desc}
            </p>

            <div className="p-4 rounded-xl bg-[#0a0807] border border-white/5 text-[#f8cba2] whitespace-pre-wrap leading-relaxed">
              {selectedCmd.example}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8c7866] font-sans">
            <span>🛡️ In-memory execution</span>
            <span>Argon2id + AES-256-GCM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
