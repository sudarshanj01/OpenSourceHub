'use client';

import React, { useState } from 'react';
import { Cpu, Terminal, Shield, Lock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function ArchitectureDiagram() {
  const [activeTab, setActiveTab] = useState<'linux' | 'macos' | 'windows'>('linux');

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 lg:p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Cross-Platform Synchronous Kernel Interception
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            How EnvShield uses native OS kernel APIs to halt calling processes before file descriptors are released.
          </p>
        </div>

        {/* OS Platform Tabs */}
        <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('linux')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'linux'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Linux (fanotify)
          </button>
          <button
            onClick={() => setActiveTab('macos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'macos'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            macOS (EndpointSecurity)
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'windows'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Windows (Minifilter)
          </button>
        </div>
      </div>

      {/* Workflow Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1 */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold font-mono mb-3">
              01
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Untrusted Access</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI agent (Claude Code, Cursor), script, or user executes a read or edit command on any <code className="text-emerald-400">.env</code> file.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
            $ cat /project/.env
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-zinc-950/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_0_15px_-4px_rgba(6,182,212,0.15)]">
          <div>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono mb-3">
              02
            </div>
            <h4 className="text-sm font-bold text-cyan-300 mb-1">Kernel Freeze</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeTab === 'linux' && 'Linux kernel triggers FAN_OPEN_PERM. The calling thread is suspended in kernel space.'}
              {activeTab === 'macos' && 'macOS kernel fires ES_EVENT_TYPE_AUTH_OPEN. The calling thread pauses in XNU kernel.'}
              {activeTab === 'windows' && 'Windows Filter Manager intercepts IRP_MJ_CREATE in kernel mode, pausing I/O.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] font-mono text-cyan-400">
            {activeTab === 'linux' && 'fanotify_init(FAN_CLASS_CONTENT)'}
            {activeTab === 'macos' && 'es_subscribe(ES_EVENT_TYPE_AUTH_OPEN)'}
            {activeTab === 'windows' && 'FltRegisterFilter(IRP_MJ_CREATE)'}
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-zinc-950/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_0_15px_-4px_rgba(16,185,129,0.15)]">
          <div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono mb-3">
              03
            </div>
            <h4 className="text-sm font-bold text-emerald-300 mb-1">Human Screen Modal</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              EnvShield daemon spawns a native desktop modal dialog. The AI agent in terminal cannot see or touch this prompt.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] font-mono text-emerald-400">
            zenity / pinentry modal prompt
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold font-mono mb-3">
              04
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Verdict Enforcement</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verified password: sends <code className="text-emerald-400 font-semibold">ALLOW</code>.
              Wrong password / timeout / deny: sends <code className="text-red-400 font-semibold">DENY</code>. Agent receives instant <code className="text-red-400">EACCES: Permission denied</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
            Zero plaintext leak. Period.
          </div>
        </div>
      </div>
    </div>
  );
}
