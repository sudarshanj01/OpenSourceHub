'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#14110f] border-t border-[#ef9846]/15 py-12">
      <div className="max-w-[1040px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#ef9846]/10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Shield Logo"
                className="w-7 h-7 rounded-lg object-cover border border-[#ef9846]/30"
              />
              <span className="font-display font-bold text-lg text-[#fbfbf9] tracking-tight">
                Shield
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/25 text-[10px] font-mono">
                v0.3.0
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#a89785]">
              <Globe className="w-3.5 h-3.5 text-[#ef9846]" />
              <a
                href="https://shield.opensourcehub.dpdns.org"
                target="_blank"
                rel="noreferrer"
                className="text-[#ef9846] hover:underline"
              >
                shield.opensourcehub.dpdns.org
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#cfb8a2]">
            <Link href="/" className="hover:text-[#ef9846] transition-colors">
              Home
            </Link>
            <Link href="/doc" className="hover:text-[#ef9846] transition-colors">
              CLI Docs
            </Link>
            <a
              href="https://github.com/sudarshanj01/OpenSourceHub/tree/main/projects/104-envshield-kernel-guard"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#ef9846] transition-colors inline-flex items-center gap-1"
            >
              GitHub
              <ArrowUpRight className="w-3 h-3 text-[#8e7a68]" />
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8e7a68]">
          <div>&copy; {new Date().getFullYear()} Shield (OpenSourceHub). Apache-2.0 &amp; MIT.</div>
          <div className="flex items-center gap-1">
            <span>Built for agentic security</span>
            <Heart className="w-3 h-3 text-[#ef9846] fill-[#ef9846]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
