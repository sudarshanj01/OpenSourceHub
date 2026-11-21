"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, FileCode, Printer, HelpCircle } from "lucide-react";

export function AntiHostageBanner() {
  return (
    <div className="space-y-8">
      {/* Hero Problem vs Solution Card */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-[#0e1422] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                The "Hostage QR Code" Problem
              </h2>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Why thousands of businesses lose hundreds of dollars to online QR generators every month.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            Zero Monthly Fees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Commercial SaaS Trap:</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>Lures you with "Free QR Code" on search engines.</li>
              <li>You print 1,000 menus, storefront signs, or business cards.</li>
              <li>After 14 days, the "trial" expires and your QR code stops working.</li>
              <li>Forces you to pay <strong>$20 to $50/month ($240–$600/year)</strong> ransom to keep your printed flyers alive!</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>The QRShield Standard:</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>You Own Your Redirects:</strong> Lives permanently on your server with no corporate middleman.</li>
              <li><strong>Unlimited Updates:</strong> Update where your printed codes point anytime in 2 clicks.</li>
              <li><strong>Zero Subscriptions:</strong> 100% free forever without expiring links or paywalls.</li>
              <li><strong>Vector Print Ready:</strong> High-resolution SVG for commercial vinyl and 300 DPI PNG.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Static vs Dynamic QR</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Static QR:</strong> Data is written directly into the dots. Works offline forever and cannot be redirected.
            <br /><br />
            <strong>Dynamic QR:</strong> Uses a short link (e.g. <code className="text-sky-300 font-mono">/r/menu</code>). Change the target URL anytime without reprinting your cards or signs!
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Print Sizing Rules</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To ensure rapid scanning by all smartphones:
            <br />• <strong>Business Cards:</strong> Min 2.0 × 2.0 cm (0.8 × 0.8 in)
            <br />• <strong>Table Stands:</strong> Min 3.5 × 3.5 cm (1.4 × 1.4 in)
            <br />• <strong>Wall Posters:</strong> Min 10 × 10 cm (4.0 × 4.0 in)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">PNG vs Vector SVG</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            • <strong>PNG:</strong> Best for digital screens, websites, emails, and small photo prints (300 DPI).
            <br /><br />
            • <strong>Vector SVG:</strong> Mathematical vector graphics that can scale to a billboard size with zero pixelation. Best for commercial printing.
          </p>
        </div>
      </div>
    </div>
  );
}
