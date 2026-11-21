"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Layers,
  BarChart3,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { StudioForm } from "@/components/StudioForm";
import { CampaignsList } from "@/components/CampaignsList";
import { AnalyticsView } from "@/components/AnalyticsView";
import { AntiHostageBanner } from "@/components/AntiHostageBanner";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"studio" | "campaigns" | "analytics" | "guide">("studio");
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0a0e17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white text-lg tracking-tight">QRShield</div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Permanent QR Codes & Campaigns
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "studio", label: "Studio", icon: Sparkles },
              {
                id: "campaigns",
                label: "Campaigns",
                icon: Layers,
                badge: campaigns.length,
              },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "guide", label: "Why QRShield?", icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "studio" && (
          <div className="animate-in fade-in duration-200">
            <StudioForm
              onCampaignCreated={() => {
                fetchCampaigns();
                setActiveTab("campaigns");
              }}
            />
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="animate-in fade-in duration-200">
            <CampaignsList campaigns={campaigns} onRefresh={fetchCampaigns} />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsView />
          </div>
        )}

        {activeTab === "guide" && (
          <div className="animate-in fade-in duration-200">
            <AntiHostageBanner />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0e17] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">QRShield</span>
            <span>—</span>
            <span>Permanent QR codes that never expire or hold your traffic hostage.</span>
          </div>
          <span className="text-slate-500 text-[11px]">Free & Self-Deployable</span>
        </div>
      </footer>
    </div>
  );
}
