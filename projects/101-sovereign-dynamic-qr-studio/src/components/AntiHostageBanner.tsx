"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export function AntiHostageBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900 p-6 shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <ShieldCheck className="w-48 h-48 text-amber-400" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              The "Dynamic QR Code Hostage" Scam & How QRShield Protects You
            </h2>
            <p className="text-xs text-amber-200/80">
              Why business owners, restaurants, and event organizers lose hundreds of dollars to predatory SaaS.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-semibold">
          Sovereign Protection Standard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
        <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Predatory Commercial SaaS Trap:</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Lures you with "Free Dynamic QR Code" on search engines.</li>
            <li>You print 1,000 menus, storefront signs, flyers, or business cards.</li>
            <li>After 14 days, your "trial" expires and your QR code stops redirecting.</li>
            <li>Demands <strong>$20 to $50 per month ($240–$600/yr)</strong> ransom to unfreeze your printed paper!</li>
          </ul>
        </div>

        <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>The QRShield Sovereign Guarantee:</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>You Own The Server:</strong> Runs on your own container; zero corporate intermediary.</li>
            <li><strong>Infinite Redirect Freedom:</strong> Change destination URLs 50 times a day without reprinting.</li>
            <li><strong>100% Free Forever:</strong> Zero subscriptions, zero watermark, zero expiration dates.</li>
            <li><strong>High-Resolution Vector SVG & PNG:</strong> Crisp export ready for commercial printing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
