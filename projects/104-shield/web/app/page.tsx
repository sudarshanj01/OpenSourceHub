'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItSolves from '@/components/HowItSolves';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#14110f] text-[#cfb8a2] font-sans selection:bg-[#ef9846]/30 selection:text-[#fbfbf9]">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <HowItSolves />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
