'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TwoPillars from '@/components/TwoPillars';
import InteractiveTerminal from '@/components/InteractiveTerminal';
import CommandsGrid from '@/components/CommandsGrid';
import ThreatMatrix from '@/components/ThreatMatrix';
import SecuritySection from '@/components/SecuritySection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#14110f] text-[#cfb8a2] font-sans selection:bg-[#ef9846]/30 selection:text-[#fbfbf9]">
      {/* Top Fixed Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Installation options & high-level value prop */}
        <Hero />

        {/* The Two Pillars: Agent Quarantine vs Seamless Execution */}
        <TwoPillars />

        {/* Live Interactive Terminal Simulator */}
        <InteractiveTerminal />

        {/* Complete Command Line Workflow Reference */}
        <CommandsGrid />

        {/* Real-world Threat Matrix comparison */}
        <ThreatMatrix />

        {/* Cryptographic and OS-level Security Deep-Dive */}
        <SecuritySection />
      </main>

      {/* Footer with final CTA, links, and domain info */}
      <Footer />
    </div>
  );
}
