"use client";

import React, { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Wifi,
  UserCheck,
  FileText,
  Palette,
  Layers,
  Shield,
  Save,
  Check,
  Sparkles,
  Lock,
  Zap,
  Globe,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { QRPreview, QRStyleOptions } from "./QRPreview";

interface StudioFormProps {
  onCampaignCreated: () => void;
}

export function StudioForm({ onCampaignCreated }: StudioFormProps) {
  // Mode Selector: Dynamic vs Static
  const [isDynamic, setIsDynamic] = useState<boolean>(true);

  // Content Mode
  const [contentType, setContentType] = useState<"url" | "wifi" | "vcard" | "text">("url");

  // Content Fields
  const [url, setUrl] = useState("https://example.com/summer-specials");
  const [wifiSsid, setWifiSsid] = useState("Artisan_Guest_WiFi");
  const [wifiPassword, setWifiPassword] = useState("CoffeeAndCroissants2026");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [vcardName, setVcardName] = useState("Alex Rivera");
  const [vcardOrg, setVcardOrg] = useState("Rivera Design Studio");
  const [vcardTitle, setVcardTitle] = useState("Principal Architect");
  const [vcardPhone, setVcardPhone] = useState("+1 (555) 349-2041");
  const [vcardEmail, setVcardEmail] = useState("alex@riveradesign.io");
  const [vcardWeb, setVcardWeb] = useState("https://riveradesign.io");
  const [plainText, setPlainText] = useState("Welcome! Ask your server for today's seasonal tasting menu.");

  // Dynamic Settings
  const [campaignTitle, setCampaignTitle] = useState("Patio Table QR — Summer 2026");
  const [campaignSlug, setCampaignSlug] = useState("patio-summer-2026");
  const [campaignDesc, setCampaignDesc] = useState("Printed on acrylic stands. Editable anytime.");
  const [enablePassword, setEnablePassword] = useState(false);
  const [passcode, setPasscode] = useState("");

  // Styling Options
  const [styling, setStyling] = useState<QRStyleOptions>({
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
    logoUrl: "",
    logoSize: 0.35,
    frameEnabled: true,
    frameText: "SCAN ME",
    frameColor: "#0284c7",
  });

  const [activeTab, setActiveTab] = useState<"content" | "design" | "frame">("content");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute final QR payload
  const qrPayload = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3101";

    if (isDynamic) {
      const cleanSlug = campaignSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "summer-specials";
      return `${origin}/r/${cleanSlug}`;
    }

    switch (contentType) {
      case "url":
        return url.trim() || "https://example.com";
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL;TYPE=CELL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardWeb}\nEND:VCARD`;
      case "text":
        return plainText;
      default:
        return "https://example.com";
    }
  }, [
    isDynamic,
    campaignSlug,
    contentType,
    url,
    wifiSsid,
    wifiEncryption,
    wifiPassword,
    vcardName,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardWeb,
    plainText,
  ]);

  // Handle Save Campaign
  const handleSaveCampaign = async () => {
    setSaving(true);
    setSavedSuccess(false);

    let destination = url;
    if (contentType === "wifi") {
      destination = `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
    } else if (contentType === "vcard") {
      destination = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL;TYPE=CELL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardWeb}\nEND:VCARD`;
    } else if (contentType === "text") {
      destination = plainText;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle.trim() || "Untitled Campaign",
          description: campaignDesc,
          slug: campaignSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
          destinationUrl: destination,
          type: isDynamic ? "DYNAMIC" : "STATIC",
          qrType: contentType.toUpperCase(),
          passcode: enablePassword && passcode.trim() ? passcode.trim() : null,
          stylingConfig: styling,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        onCampaignCreated();
      } else {
        alert(data.error || "Failed to save campaign");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save campaign. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Studio Builder */}
      <div className="lg:col-span-7 space-y-6">
        {/* Tactile Mode Switcher: Dynamic vs Static */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1422] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              QR Code Mode
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              Self-Hosted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {/* Dynamic Option */}
            <button
              type="button"
              onClick={() => setIsDynamic(true)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-start gap-3 ${
                isDynamic
                  ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/50 shadow-md text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isDynamic ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Dynamic Short Link</span>
                  {isDynamic && <span className="text-[10px] text-sky-400 font-mono">ACTIVE</span>}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Edit destination anytime without reprinting flyers or menus.
                </p>
              </div>
            </button>

            {/* Static Option */}
            <button
              type="button"
              onClick={() => setIsDynamic(false)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-start gap-3 ${
                !isDynamic
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/50 shadow-md text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  !isDynamic ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Direct Static QR</span>
                  {!isDynamic && <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Data encoded directly into matrix. Works offline forever.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Studio Tabs: Content, Design, Frame */}
        <div className="rounded-3xl bg-[#0e1422] border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "content", label: "1. Content & Destination", icon: LinkIcon },
              { id: "design", label: "2. Colors & Shapes", icon: Palette },
              { id: "frame", label: "3. Stand Frame & Badge", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CONTENT */}
          {activeTab === "content" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Content Type Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "url", label: "Website URL", icon: Globe },
                  { id: "wifi", label: "Wi-Fi Connect", icon: Wifi },
                  { id: "vcard", label: "Contact Card", icon: UserCheck },
                  { id: "text", label: "Plain Text", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = contentType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContentType(item.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        selected
                          ? "bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-md shadow-sky-500/10"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Campaign Meta Fields */}
              {isDynamic && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Short Link Redirect Setup
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Campaign Title</label>
                      <input
                        type="text"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        placeholder="e.g. Table QR — Summer 2026"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Custom Short Slug</label>
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 bg-slate-900 px-2.5 py-2 rounded-l-xl border-y border-l border-slate-700 font-mono">
                          /r/
                        </span>
                        <input
                          type="text"
                          value={campaignSlug}
                          onChange={(e) => setCampaignSlug(e.target.value)}
                          placeholder="summer-specials"
                          className="w-full px-3 py-2 rounded-r-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Protection Toggle */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-slate-300 font-medium">Require Passcode to Unlock</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnablePassword(!enablePassword)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        enablePassword ? "bg-amber-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          enablePassword ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {enablePassword && (
                    <div className="space-y-1 animate-in fade-in">
                      <label className="text-xs font-semibold text-slate-300">Unlock PIN / Passcode</label>
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="e.g. 7890 or secretpass"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Forms depending on Content Type */}
              {contentType === "url" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Destination Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourdomain.com/menu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    {isDynamic
                      ? "When scanned, visitors will instantly be redirected to this target destination."
                      : "Directly embedded into the QR matrix. Works offline without touching any server."}
                  </p>
                </div>
              )}

              {contentType === "wifi" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Wi-Fi Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyLounge_5G"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Security Type</label>
                      <select
                        value={wifiEncryption}
                        onChange={(e: any) => setWifiEncryption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="WPA">WPA/WPA2/WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <input
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Network password"
                        disabled={wifiEncryption === "nopass"}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === "vcard" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Company / Brand</label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        placeholder="Studio"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Job Title</label>
                      <input
                        type="text"
                        value={vcardTitle}
                        onChange={(e) => setVcardTitle(e.target.value)}
                        placeholder="Managing Partner"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        placeholder="alex@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Website</label>
                      <input
                        type="url"
                        value={vcardWeb}
                        onChange={(e) => setVcardWeb(e.target.value)}
                        placeholder="https://portfolio.io"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === "text" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Plain Text / Note</label>
                  <textarea
                    rows={4}
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder="Enter instructions, notes, or promo codes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DESIGN & SHAPES */}
          {activeTab === "design" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dot Shape Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">QR Matrix Dot Pattern</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: "rounded", label: "Rounded" },
                    { id: "dots", label: "Circles" },
                    { id: "classy", label: "Classy" },
                    { id: "classy-rounded", label: "Modern" },
                    { id: "extra-rounded", label: "Soft" },
                    { id: "square", label: "Square" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setStyling((prev) => ({ ...prev, dotType: d.id as any }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        styling.dotType === d.id
                          ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Shapes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Corner Square Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "extra-rounded", label: "Smooth" },
                      { id: "dot", label: "Round" },
                      { id: "square", label: "Classic" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, cornerSquareType: c.id as any }))}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          styling.cornerSquareType === c.id
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Corner Dot Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "dot", label: "Round Dot" },
                      { id: "square", label: "Square" },
                    ].map((cd) => (
                      <button
                        key={cd.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, cornerDotType: cd.id as any }))}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          styling.cornerDotType === cd.id
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gradient Color Engine */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Linear Gradient Engine
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setStyling((prev) => ({ ...prev, gradientEnabled: !prev.gradientEnabled }))
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                      styling.gradientEnabled ? "bg-sky-500" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        styling.gradientEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {styling.gradientEnabled ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Start Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={styling.gradientStart}
                            onChange={(e) =>
                              setStyling((prev) => ({ ...prev, gradientStart: e.target.value }))
                            }
                            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-slate-300">{styling.gradientStart}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">End Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={styling.gradientEnd}
                            onChange={(e) =>
                              setStyling((prev) => ({ ...prev, gradientEnd: e.target.value }))
                            }
                            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-slate-300">{styling.gradientEnd}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Rotation Angle</label>
                        <select
                          value={styling.gradientRotation}
                          onChange={(e) =>
                            setStyling((prev) => ({
                              ...prev,
                              gradientRotation: parseInt(e.target.value),
                            }))
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          <option value="0">0° (Horizontal)</option>
                          <option value="45">45° (Diagonal)</option>
                          <option value="90">90° (Vertical)</option>
                          <option value="135">135° (Reverse Diagonal)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preset Gradients */}
                    <div className="pt-2 border-t border-slate-900 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-500">Presets:</span>
                      {[
                        { label: "Cyan Sky", start: "#0284c7", end: "#06b6d4" },
                        { label: "Violet Iris", start: "#6366f1", end: "#a855f7" },
                        { label: "Emerald Mint", start: "#059669", end: "#10b981" },
                        { label: "Sunset Rose", start: "#ea580c", end: "#f43f5e" },
                        { label: "Obsidian", start: "#0f172a", end: "#334155" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setStyling((prev) => ({
                              ...prev,
                              gradientStart: preset.start,
                              gradientEnd: preset.end,
                            }))
                          }
                          className="px-2 py-1 rounded-md text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Solid Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.dotsColor}
                        onChange={(e) =>
                          setStyling((prev) => ({ ...prev, dotsColor: e.target.value }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{styling.dotsColor}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Center Logo Option */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Center Brand Logo URL (Optional)</label>
                <input
                  type="url"
                  value={styling.logoUrl || ""}
                  onChange={(e) => setStyling((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: Clean transparent PNG or SVG logos work best. High error correction is enabled automatically.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FRAME & CALLOUT BADGE */}
          {activeTab === "frame" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Physical Card Frame Badge
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Renders a callout border and top header badge for table stands or flyers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStyling((prev) => ({ ...prev, frameEnabled: !prev.frameEnabled }))
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                      styling.frameEnabled ? "bg-sky-500" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        styling.frameEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {styling.frameEnabled && (
                  <div className="space-y-4 pt-2 border-t border-slate-900">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Top Badge Header Text
                      </label>
                      <input
                        type="text"
                        value={styling.frameText || ""}
                        onChange={(e) =>
                          setStyling((prev) => ({ ...prev, frameText: e.target.value }))
                        }
                        placeholder="SCAN ME"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm uppercase tracking-wider font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Frame Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={styling.frameColor || "#0284c7"}
                            onChange={(e) =>
                              setStyling((prev) => ({ ...prev, frameColor: e.target.value }))
                            }
                            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-slate-300">
                            {styling.frameColor || "#0284c7"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Badge Presets</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["SCAN ME", "VISIT MENU", "CONNECT WI-FI", "SAVE CONTACT"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setStyling((prev) => ({ ...prev, frameText: preset }))}
                              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-[10px] text-slate-300 font-bold"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Row: Save Campaign */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Ready to print or deploy
            </span>

            <button
              type="button"
              onClick={handleSaveCampaign}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Campaigns!</span>
                </>
              ) : saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Campaign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Interactive QR Preview */}
      <div className="lg:col-span-5 sticky top-6">
        <div className="rounded-3xl bg-[#0e1422] border border-slate-800 p-6 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Live Vector Preview
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Interactive
            </span>
          </div>

          <QRPreview
            data={qrPayload}
            options={styling}
            title={campaignTitle}
            slug={isDynamic ? campaignSlug : undefined}
            isDynamic={isDynamic}
          />
        </div>
      </div>
    </div>
  );
}
