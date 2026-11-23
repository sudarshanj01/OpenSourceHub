'use client';

import React from 'react';
import { Shield, Github, Terminal, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">EnvShield</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                v0.1.0 (Rust)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">Kernel Secret Guard for AI Era</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <a href="#simulator" className="hover:text-emerald-400 transition-colors">
            Interactive Simulator
          </a>
          <a href="#architecture" className="hover:text-emerald-400 transition-colors">
            Kernel Architecture
          </a>
          <a href="#quickstart" className="hover:text-emerald-400 transition-colors">
            Quickstart CLI
          </a>
          <a href="#matrix" className="hover:text-emerald-400 transition-colors">
            Threat Matrix
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/sudarshanj01/OpenSourceHub/tree/main/projects/104-envshield-kernel-guard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-all"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">Source Code</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>
      </div>
    </header>
  );
}
