"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@ui-sdk/react/tabs";
import { Button } from "@ui-sdk/react/button";
import {
  ShieldCheck,
  QrCode,
  Layers,
  BarChart3,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import { StudioForm } from "@/components/StudioForm";
import { CampaignsList } from "@/components/CampaignsList";
import { AnalyticsView } from "@/components/AnalyticsView";
import { AntiHostageBanner } from "@/components/AntiHostageBanner";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("studio");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error("Failed to load campaigns:", e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500 py-1.5 px-4 text-center text-xs font-semibold text-white tracking-wide shadow-md flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Sovereign QRShield — Free from $40/mo Hostage Subscriptions & Tracking Ads</span>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">QRShield</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold">
                  v1.0 Sovereign
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Dynamic QR & Anti-Ransom Campaign Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Next.js 16 • UI-SDK • Port 3101
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="studio" value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          {/* Top Level Nav Tabs built on @ui-sdk/react */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-8 overflow-x-auto">
            <TabsList aria-label="Main Navigation" className="flex items-center gap-2">
              <TabsTab
                value="studio"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 data-[selected]:bg-sky-500 data-[selected]:text-white data-[selected]:shadow-lg data-[selected]:shadow-sky-500/20"
              >
                <Sparkles className="w-4 h-4" />
                QR Studio & Styler
              </TabsTab>

              <TabsTab
                value="campaigns"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 data-[selected]:bg-sky-500 data-[selected]:text-white data-[selected]:shadow-lg data-[selected]:shadow-sky-500/20"
              >
                <Layers className="w-4 h-4" />
                Campaigns & Slugs
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono data-[selected]:bg-white/20">
                  {campaigns.length}
                </span>
              </TabsTab>

              <TabsTab
                value="analytics"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 data-[selected]:bg-sky-500 data-[selected]:text-white data-[selected]:shadow-lg data-[selected]:shadow-sky-500/20"
              >
                <BarChart3 className="w-4 h-4" />
                Scan Intelligence
              </TabsTab>

              <TabsTab
                value="anti-scam"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 data-[selected]:bg-sky-500 data-[selected]:text-white data-[selected]:shadow-lg data-[selected]:shadow-sky-500/20"
              >
                <HelpCircle className="w-4 h-4" />
                Anti-Hostage Guide
              </TabsTab>
            </TabsList>
          </div>

          {/* TAB 1: STUDIO */}
          <TabsPanel value="studio" className="space-y-8 animate-in fade-in">
            <StudioForm
              onCampaignCreated={() => {
                fetchCampaigns();
                setActiveTab("campaigns");
              }}
            />
          </TabsPanel>

          {/* TAB 2: CAMPAIGNS */}
          <TabsPanel value="campaigns" className="animate-in fade-in">
            <CampaignsList campaigns={campaigns} onRefresh={fetchCampaigns} />
          </TabsPanel>

          {/* TAB 3: SCAN ANALYTICS */}
          <TabsPanel value="analytics" className="animate-in fade-in">
            <AnalyticsView />
          </TabsPanel>

          {/* TAB 4: ANTI-SCAM GUIDE */}
          <TabsPanel value="anti-scam" className="space-y-8 animate-in fade-in">
            <AntiHostageBanner />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Static vs Dynamic QR</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Static QR codes</strong> encode your target text or Wi-Fi keys directly into the pixels. They work offline forever and can never expire.
                  <br /><br />
                  <strong>Dynamic QR codes</strong> point to your sovereign short slug (e.g. <code className="text-sky-300">/r/menu</code>) and redirect to your destination. You can update where it points without reprinting!
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Commercial Extortion Model</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Most online QR generators rank on Google for "free QR code" but secretly generate dynamic links pointing to <em>their</em> servers. Once you distribute printed flyers, they hold your traffic hostage for $15–$50/month.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Print Sizing Rules of Thumb</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For optimal smartphone camera scanning:
                  <br />• <strong>Business Cards:</strong> minimum 2 × 2 cm (0.8 × 0.8 in)
                  <br />• <strong>Table Acrylic Stands:</strong> minimum 3.5 × 3.5 cm
                  <br />• <strong>Wall Posters & Banners:</strong> minimum 10 × 10 cm
                  <br />Always export in <strong>Vector SVG</strong> for vinyl signage.
                </p>
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OpenSourceHub</span>
            <span>•</span>
            <span>Project 101: Sovereign Dynamic QR Studio</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Powered by Next.js 16, @ui-sdk/react, and PostgreSQL 16 Alpine. Zero SaaS Lock-in.
          </p>
        </div>
      </footer>
    </div>
  );
}
