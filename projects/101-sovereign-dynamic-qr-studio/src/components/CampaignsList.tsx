"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Edit2,
  Trash2,
  QrCode,
  CheckCircle2,
  PauseCircle,
  Copy,
  Check,
  TrendingUp,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";
import { QRPreview, QRStyleOptions } from "./QRPreview";

interface CampaignItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  destinationUrl: string;
  type: string;
  qrType: string;
  passcode?: string;
  isActive: boolean;
  totalScans: number;
  stylingConfig: string;
  createdAt: string;
}

interface CampaignsListProps {
  campaigns: CampaignItem[];
  onRefresh: () => void;
}

export function CampaignsList({ campaigns, onRefresh }: CampaignsListProps) {
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [newDestinationUrl, setNewDestinationUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewingCampaign, setPreviewingCampaign] = useState<CampaignItem | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleOpenEdit = (camp: CampaignItem) => {
    setEditingCampaign(camp);
    setNewDestinationUrl(camp.destinationUrl);
    setNewTitle(camp.title);
    setNewPasscode(camp.passcode || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCampaign) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          destinationUrl: newDestinationUrl,
          passcode: newPasscode.trim() ? newPasscode : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCampaign(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to update campaign:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (camp: CampaignItem) => {
    try {
      await fetch(`/api/campaigns/${camp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !camp.isActive }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
      return;
    }
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shortLink = `${origin}/r/${slug}`;
    navigator.clipboard.writeText(shortLink);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Campaigns</h2>
          <p className="text-xs text-slate-400 mt-1">
            Change target destinations anytime. Your printed codes will update instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#0e1422] border border-slate-800">
          <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No Campaigns Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create your first QR code using the Studio builder tab above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((camp) => {
            let styling: QRStyleOptions = {
              dotType: "rounded",
              cornerSquareType: "extra-rounded",
              cornerDotType: "dot",
              dotsColor: "#0284c7",
              gradientEnabled: true,
              gradientType: "linear",
              gradientStart: "#0284c7",
              gradientEnd: "#06b6d4",
              gradientRotation: 45,
              bgColor: "#ffffff",
              frameEnabled: true,
              frameText: "SCAN ME",
              frameColor: "#0284c7",
            };
            try {
              if (camp.stylingConfig) {
                styling = { ...styling, ...JSON.parse(camp.stylingConfig) };
              }
            } catch (e) {}

            return (
              <div
                key={camp.id}
                className="rounded-2xl bg-[#0e1422] border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${styling.gradientStart || "#0284c7"}, ${
                      styling.gradientEnd || "#06b6d4"
                    })`,
                  }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                          camp.type === "DYNAMIC"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {camp.type}
                      </span>
                      {camp.passcode && (
                        <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          <Lock className="w-2.5 h-2.5" /> PIN
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(camp)}
                      className="cursor-pointer text-xs flex items-center gap-1 font-medium text-slate-400 hover:text-white"
                      title={camp.isActive ? "Click to Pause" : "Click to Activate"}
                    >
                      {camp.isActive ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                          <PauseCircle className="w-3.5 h-3.5" /> Paused
                        </span>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{camp.title}</h3>
                  {camp.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{camp.description}</p>
                  )}

                  <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-slate-300 font-semibold">/r/{camp.slug}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(camp.slug)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy short link"
                      >
                        {copiedSlug === camp.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={camp.destinationUrl}>
                      Target: <span className="text-slate-400 font-mono">{camp.destinationUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-sm font-mono">{camp.totalScans}</span>
                    <span className="text-[11px] text-slate-500">scans</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewingCampaign(camp)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
                      title="View & Download QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {camp.type === "DYNAMIC" && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(camp)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
                        title="Edit Target URL"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(camp.id)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer border border-slate-800"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Target URL Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1422] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Update Destination URL
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Change where <span className="font-mono text-sky-400">/r/{editingCampaign.slug}</span> leads.
                  Printed materials remain unchanged!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Campaign Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Destination URL</label>
                <input
                  type="url"
                  value={newDestinationUrl}
                  onChange={(e) => setNewDestinationUrl(e.target.value)}
                  placeholder="https://example.com/new-page"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Passcode Protection (Optional)</label>
                <input
                  type="password"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Leave empty for public redirect"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Instant Redirect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {previewingCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1422] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white truncate max-w-[280px]">
                {previewingCampaign.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewingCampaign(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              let styling: QRStyleOptions = {
                dotType: "rounded",
                cornerSquareType: "extra-rounded",
                cornerDotType: "dot",
                dotsColor: "#0284c7",
                gradientEnabled: true,
                gradientType: "linear",
                gradientStart: "#0284c7",
                gradientEnd: "#06b6d4",
                gradientRotation: 45,
                bgColor: "#ffffff",
                frameEnabled: true,
                frameText: "SCAN ME",
                frameColor: "#0284c7",
              };
              try {
                if (previewingCampaign.stylingConfig) {
                  styling = { ...styling, ...JSON.parse(previewingCampaign.stylingConfig) };
                }
              } catch (e) {}

              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const qrData =
                previewingCampaign.type === "DYNAMIC"
                  ? `${origin}/r/${previewingCampaign.slug}`
                  : previewingCampaign.destinationUrl;

              return (
                <QRPreview
                  data={qrData}
                  options={styling}
                  title={previewingCampaign.title}
                  slug={previewingCampaign.slug}
                  isDynamic={previewingCampaign.type === "DYNAMIC"}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
