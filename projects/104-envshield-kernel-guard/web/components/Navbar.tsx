'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Github, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#14110f]/85 backdrop-blur-md border-b border-[#ef9846]/15 py-3.5 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Shield Logo"
            className="w-9 h-9 rounded-xl object-cover border border-[#ef9846]/30 shadow-[0_0_20px_-3px_rgba(239,152,70,0.35)] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-[#fbfbf9] tracking-tight group-hover:text-[#ef9846] transition-colors">
                Shield
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ef9846]/10 text-[#ef9846] border border-[#ef9846]/25 text-[10px] font-mono font-medium">
                v0.3.0
              </span>
            </div>
            <span className="text-[10px] text-[#a89785] tracking-wide uppercase font-medium">
              Sovereign Secret Vault
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#cfb8a2] whitespace-nowrap">
          <Link href="/" className="hover:text-[#ef9846] transition-colors">
            Home
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#ef9846] transition-colors">
            How It Works
          </Link>
          <Link href="/doc" className="hover:text-[#ef9846] transition-colors">
            Docs
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-4 whitespace-nowrap">
          <a
            href="https://github.com/sudarshanj01/OpenSourceHub/tree/main/projects/104-envshield-kernel-guard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#cfb8a2] hover:text-[#fbfbf9] transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
          <Link
            href="/doc"
            className="px-4 py-2 rounded-full bg-[#ef9846] hover:bg-[#f8cba2] text-[#14110f] font-semibold text-xs tracking-wide transition-all shadow-[0_0_25px_-5px_rgba(239,152,70,0.5)] flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5" />
            CLI Docs
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-[#cfb8a2] hover:text-[#fbfbf9] p-2"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#181411] border-b border-[#ef9846]/20 px-6 py-6 space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#cfb8a2] hover:text-[#ef9846]"
          >
            Home
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#cfb8a2] hover:text-[#ef9846]"
          >
            How It Works
          </Link>
          <Link
            href="/doc"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#cfb8a2] hover:text-[#ef9846]"
          >
            Docs
          </Link>
          <div className="pt-2 border-t border-white/5 flex flex-col gap-3">
            <Link
              href="/doc"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#ef9846] text-[#14110f] font-bold text-xs"
            >
              CLI Docs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
