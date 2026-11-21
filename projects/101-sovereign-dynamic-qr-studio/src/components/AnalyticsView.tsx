"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@ui-sdk/react/button";
import {
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Clock,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface ScanLog {
  id: string;
  device: string | null;
  os: string | null;
  browser: string | null;
  scannedAt: string;
  campaignTitle?: string;
  campaignSlug?: string;
}

export function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [stats, setStats] = useState<{
    totalScans: number;
    devices: Record<string, number>;
    oss: Record<string, number>;
    browsers: Record<string, number>;
    recentScans: ScanLog[];
  }>({
    totalScans: 0,
    devices: {},
    oss: {},
    browsers: {},
    recentScans: [],
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const campRes = await fetch("/api/campaigns");
      const campData = await campRes.json();
      if (campData.success) {
        setCampaigns(campData.campaigns || []);

        // Fetch detailed stats
        let total = 0;
        const devices: Record<string, number> = {};
        const oss: Record<string, number> = {};
        const browsers: Record<string, number> = {};
        const recent: ScanLog[] = [];

        for (const camp of campData.campaigns) {
          total += camp.totalScans || 0;
          try {
            const detailRes = await fetch(`/api/campaigns/${camp.id}`);
            const detailData = await detailRes.json();
            if (detailData.success && detailData.analytics) {
              const a = detailData.analytics;
              Object.entries(a.devices || {}).forEach(([k, v]) => {
                devices[k] = (devices[k] || 0) + (v as number);
              });
              Object.entries(a.oss || {}).forEach(([k, v]) => {
                oss[k] = (oss[k] || 0) + (v as number);
              });
              Object.entries(a.browsers || {}).forEach(([k, v]) => {
                browsers[k] = (browsers[k] || 0) + (v as number);
              });

              (detailData.campaign.scans || []).forEach((s: any) => {
                recent.push({
                  ...s,
                  campaignTitle: camp.title,
                  campaignSlug: camp.slug,
                });
              });
            }
          } catch (e) {}
        }

        recent.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());

        setStats({
          totalScans: total,
          devices,
          oss,
          browsers,
          recentScans: recent.slice(0, 30),
        });
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            Privacy-Preserving Scan Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero third-party trackers. All analytics are computed privately on your local server.
          </p>
        </div>
        <Button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Campaign Scans
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.totalScans}</div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Unmetered & Free
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Campaigns
          </div>
          <div className="text-3xl font-black text-white font-mono">{campaigns.length}</div>
          <p className="text-[11px] text-sky-400 mt-2">Dynamic & Static combined</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Mobile Scans Ratio
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalScans > 0
              ? `${Math.round(((stats.devices["Mobile"] || 0) / stats.totalScans) * 100)}%`
              : "0%"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Smartphone camera lenses</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Top Operating System
          </div>
          <div className="text-2xl font-black text-white font-mono truncate">
            {Object.entries(stats.oss).sort((a, b) => b[1] - a[1])[0]?.[0] || "iOS"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Native camera app scan</p>
        </div>
      </div>

      {/* Breakdown Grids: Devices, OS, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            {["Mobile", "Desktop", "Tablet"].map((dev) => {
              const count = stats.devices[dev] || 0;
              const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
              return (
                <div key={dev} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{dev}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-400" />
            Operating Systems
          </h3>
          <div className="space-y-3">
            {["iOS", "Android", "macOS", "Windows", "Linux"].map((os) => {
              const count = stats.oss[os] || 0;
              const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
              return (
                <div key={os} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{os}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Browser Distribution
          </h3>
          <div className="space-y-3">
            {["Safari", "Chrome", "Firefox", "Edge", "Other"].map((br) => {
              const count = stats.browsers[br] || 0;
              const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
              return (
                <div key={br} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{br}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Recent Scan Activity (Real-time Feed)
        </h3>

        {stats.recentScans.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No scans recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">Campaign</th>
                  <th className="pb-2.5 font-semibold">Device</th>
                  <th className="pb-2.5 font-semibold">OS</th>
                  <th className="pb-2.5 font-semibold">Browser</th>
                  <th className="pb-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stats.recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-medium text-white">
                      {scan.campaignTitle || "Campaign"}
                      <span className="block text-[11px] text-slate-500 font-mono">
                        /r/{scan.campaignSlug}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                        {scan.device || "Mobile"}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{scan.os || "Unknown"}</td>
                    <td className="py-2.5 text-slate-400">{scan.browser || "Safari"}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(scan.scannedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
