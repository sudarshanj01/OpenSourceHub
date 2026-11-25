'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What will be if I forgot the master password?',
    a: 'As per security, .env files are reproducible, but recovering a lost password is a security risk. If any recovery mechanism existed, an agent or attacker could also exploit it to recover your secrets—so there is no password reset.',
  },
  {
    q: 'Can AI agents read my secrets while my app is running?',
    a: 'No. Your plaintext .env is shredded from disk, and secrets are decrypted solely in volatile RAM for your running process with PR_SET_DUMPABLE=0 memory protection.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 border-t border-[#ef9846]/10 bg-[#14110f]">
      <div className="max-w-[1040px] mx-auto px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#ef9846] mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Q&amp;A
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#fbfbf9] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#1a1613] border border-[#ef9846]/15 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#201b17]/50 transition-colors"
                >
                  <span className="font-display font-semibold text-sm sm:text-base text-[#fbfbf9]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#ef9846] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#cfb8a2] leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
