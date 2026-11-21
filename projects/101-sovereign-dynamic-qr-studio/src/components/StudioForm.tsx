"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@ui-sdk/react/tabs";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Button } from "@ui-sdk/react/button";
import { Input } from "@ui-sdk/react/input";
import { Textarea } from "@ui-sdk/react/textarea";
import { Field, FieldLabel, FieldDescription } from "@ui-sdk/react/field";
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
} from "lucide-react";
import { QRPreview, QRStyleOptions } from "./QRPreview";

interface StudioFormProps {
  onCampaignCreated: () => void;
}

export function StudioForm({ onCampaignCreated }: StudioFormProps) {
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
  const [plainText, setPlainText] = useState("Welcome to our flagship space! Ask your server for today's secret chef tasting.");

  // Sovereign Dynamic Settings
  const [isDynamic, setIsDynamic] = useState(true);
  const [campaignTitle, setCampaignTitle] = useState("Patio Table QR — Summer 2026");
  const [campaignSlug, setCampaignSlug] = useState("patio-summer-2026");
  const [campaignDesc, setCampaignDesc] = useState("Printed on table acrylic stands. Editable anytime.");
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
    frameText: "SCAN ME",
    frameColor: "#0284c7",
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "frame">("content");

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

  // Handle Save Sovereign Campaign
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
      {/* Left Column: Builder Controls */}
      <div className="lg:col-span-7 space-y-6">
        {/* Dynamic vs Static Sovereign Toggle Bar */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Sovereign Dynamic Mode</span>
              <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                Anti-Ransom
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generates a short link on your server. Change target URL anytime without reprinting.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Switch
              checked={isDynamic}
              onCheckedChange={(checked: boolean) => setIsDynamic(checked)}
              className="w-12 h-6 bg-slate-800 data-[checked]:bg-sky-500 rounded-full transition-colors relative flex items-center p-0.5"
            >
              <SwitchThumb className="w-5 h-5 bg-white rounded-full transition-transform data-[checked]:translate-x-6" />
            </Switch>
          </label>
        </div>

        {/* Main Tabs for Customization: Content, Design, Frame */}
        <div className="rounded-3xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-6">
          <Tabs defaultValue="content" onValueChange={(val: any) => setActiveTab(val)}>
            <TabsList className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <TabsTab
                value="content"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 data-[selected]:bg-slate-800 data-[selected]:text-sky-400"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                1. QR Content
              </TabsTab>
              <TabsTab
                value="design"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 data-[selected]:bg-slate-800 data-[selected]:text-sky-400"
              >
                <Palette className="w-3.5 h-3.5" />
                2. Colors & Shapes
              </TabsTab>
              <TabsTab
                value="frame"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 data-[selected]:bg-slate-800 data-[selected]:text-sky-400"
              >
                <Layers className="w-3.5 h-3.5" />
                3. Frame & Badge
              </TabsTab>
            </TabsList>

            {/* PANEL 1: CONTENT */}
            <TabsPanel value="content" className="space-y-6">
              {/* Content Type Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "url", label: "Website URL", icon: LinkIcon },
                  { id: "wifi", label: "Wi-Fi Connect", icon: Wifi },
                  { id: "vcard", label: "Digital vCard", icon: UserCheck },
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
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
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
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Sovereign Link Setup
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Campaign Title</FieldLabel>
                      <Input
                        value={campaignTitle}
                        onChange={(e: any) => setCampaignTitle(e.target.value)}
                        placeholder="e.g. Table QR — Summer 2026"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-sky-500"
                      />
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Custom Slug (Short URL)</FieldLabel>
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 bg-slate-900 px-2.5 py-2 rounded-l-xl border-y border-l border-slate-700 font-mono">
                          /r/
                        </span>
                        <Input
                          value={campaignSlug}
                          onChange={(e: any) => setCampaignSlug(e.target.value)}
                          placeholder="summer-specials"
                          className="w-full px-3 py-2 rounded-r-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Password Protection */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-slate-300 font-medium">Require Passcode to Unlock</span>
                    </div>
                    <Switch
                      checked={enablePassword}
                      onCheckedChange={(checked: boolean) => setEnablePassword(checked)}
                      className="w-10 h-5 bg-slate-800 data-[checked]:bg-amber-500 rounded-full transition-colors relative flex items-center p-0.5"
                    >
                      <SwitchThumb className="w-4 h-4 bg-white rounded-full transition-transform data-[checked]:translate-x-5" />
                    </Switch>
                  </div>

                  {enablePassword && (
                    <Field className="space-y-1 animate-in fade-in">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Unlock PIN / Passcode</FieldLabel>
                      <Input
                        type="password"
                        value={passcode}
                        onChange={(e: any) => setPasscode(e.target.value)}
                        placeholder="e.g. 7890 or secretpass"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </Field>
                  )}
                </div>
              )}

              {/* Sub-Forms depending on Content Type */}
              {contentType === "url" && (
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-semibold text-slate-300">
                    Destination Website URL
                  </FieldLabel>
                  <Input
                    type="url"
                    value={url}
                    onChange={(e: any) => setUrl(e.target.value)}
                    placeholder="https://yourdomain.com/menu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <FieldDescription className="text-[11px] text-slate-400">
                    The destination visitors reach upon scanning the QR code with their camera.
                  </FieldDescription>
                </Field>
              )}

              {contentType === "wifi" && (
                <div className="space-y-4">
                  <Field className="space-y-1">
                    <FieldLabel className="text-xs font-semibold text-slate-300">Wi-Fi Network Name (SSID)</FieldLabel>
                    <Input
                      value={wifiSsid}
                      onChange={(e: any) => setWifiSsid(e.target.value)}
                      placeholder="MyLounge_5G"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Security Type</FieldLabel>
                      <select
                        value={wifiEncryption}
                        onChange={(e: any) => setWifiEncryption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="WPA">WPA/WPA2/WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Password</FieldLabel>
                      <Input
                        type="password"
                        value={wifiPassword}
                        onChange={(e: any) => setWifiPassword(e.target.value)}
                        placeholder="Network password"
                        disabled={wifiEncryption === "nopass"}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {contentType === "vcard" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Full Name</FieldLabel>
                      <Input
                        value={vcardName}
                        onChange={(e: any) => setVcardName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Phone Number</FieldLabel>
                      <Input
                        value={vcardPhone}
                        onChange={(e: any) => setVcardPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Company / Organization</FieldLabel>
                      <Input
                        value={vcardOrg}
                        onChange={(e: any) => setVcardOrg(e.target.value)}
                        placeholder="Studio"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Job Title</FieldLabel>
                      <Input
                        value={vcardTitle}
                        onChange={(e: any) => setVcardTitle(e.target.value)}
                        placeholder="Managing Partner"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Email Address</FieldLabel>
                      <Input
                        type="email"
                        value={vcardEmail}
                        onChange={(e: any) => setVcardEmail(e.target.value)}
                        placeholder="alex@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-xs font-semibold text-slate-300">Website</FieldLabel>
                      <Input
                        type="url"
                        value={vcardWeb}
                        onChange={(e: any) => setVcardWeb(e.target.value)}
                        placeholder="https://portfolio.io"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {contentType === "text" && (
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-semibold text-slate-300">Plain Text / Note</FieldLabel>
                  <Textarea
                    rows={4}
                    value={plainText}
                    onChange={(e: any) => setPlainText(e.target.value)}
                    placeholder="Enter plain text, promo codes, or secret instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </Field>
              )}
            </TabsPanel>

            {/* PANEL 2: DESIGN & SHAPES */}
            <TabsPanel value="design" className="space-y-6">
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
                          ? "bg-sky-500/20 border-sky-400 text-sky-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
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
                            ? "bg-sky-500/20 border-sky-400 text-sky-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
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
                            ? "bg-sky-500/20 border-sky-400 text-sky-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gradient Color Engine */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Linear Gradient Engine
                  </span>
                  <Switch
                    checked={styling.gradientEnabled}
                    onCheckedChange={(checked: boolean) =>
                      setStyling((prev) => ({ ...prev, gradientEnabled: checked }))
                    }
                    className="w-10 h-5 bg-slate-800 data-[checked]:bg-sky-500 rounded-full transition-colors relative flex items-center p-0.5"
                  >
                    <SwitchThumb className="w-4 h-4 bg-white rounded-full transition-transform data-[checked]:translate-x-5" />
                  </Switch>
                </div>

                {styling.gradientEnabled ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <Field className="space-y-1">
                      <FieldLabel className="text-[11px] text-slate-400">Start Color</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={styling.gradientStart}
                          onChange={(e) =>
                            setStyling((prev) => ({ ...prev, gradientStart: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{styling.gradientStart}</span>
                      </div>
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-[11px] text-slate-400">End Color</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={styling.gradientEnd}
                          onChange={(e) =>
                            setStyling((prev) => ({ ...prev, gradientEnd: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{styling.gradientEnd}</span>
                      </div>
                    </Field>

                    <Field className="space-y-1">
                      <FieldLabel className="text-[11px] text-slate-400">Rotation Angle</FieldLabel>
                      <select
                        value={styling.gradientRotation}
                        onChange={(e) =>
                          setStyling((prev) => ({
                            ...prev,
                            gradientRotation: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      >
                        <option value="0">0° (Horizontal)</option>
                        <option value="45">45° (Diagonal)</option>
                        <option value="90">90° (Vertical)</option>
                        <option value="135">135° (Reverse Diagonal)</option>
                      </select>
                    </Field>
                  </div>
                ) : (
                  <Field className="space-y-1">
                    <FieldLabel className="text-[11px] text-slate-400">Solid Fill Color</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.dotsColor}
                        onChange={(e) =>
                          setStyling((prev) => ({ ...prev, dotsColor: e.target.value }))
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{styling.dotsColor}</span>
                    </div>
                  </Field>
                )}
              </div>

              {/* Center Logo Upload / URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Center Logo URL (Optional)</label>
                <Input
                  value={styling.logoUrl || ""}
                  onChange={(e: any) => setStyling((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/brand-logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: A high error correction level ("Q") is automatically enabled so the code scans effortlessly with a center logo.
                </p>
              </div>
            </TabsPanel>

            {/* PANEL 3: FRAME & CALLOUT BADGE */}
            <TabsPanel value="frame" className="space-y-6">
              <div className="space-y-4">
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-semibold text-slate-300">
                    Callout Header Text (Top Badge)
                  </FieldLabel>
                  <Input
                    value={styling.frameText || ""}
                    onChange={(e: any) =>
                      setStyling((prev) => ({ ...prev, frameText: e.target.value }))
                    }
                    placeholder="SCAN ME • VISIT MENU • CONNECT WI-FI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm uppercase tracking-wider font-bold"
                  />
                  <FieldDescription className="text-[11px] text-slate-400">
                    Clear the text to render a minimal borderless QR code card.
                  </FieldDescription>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field className="space-y-1">
                    <FieldLabel className="text-xs font-semibold text-slate-300">Frame Border Color</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.frameColor || "#0284c7"}
                        onChange={(e) =>
                          setStyling((prev) => ({ ...prev, frameColor: e.target.value }))
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        {styling.frameColor || "#0284c7"}
                      </span>
                    </div>
                  </Field>

                  {/* Preset Badges */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Quick Badge Presets</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["SCAN ME", "VISIT MENU", "CONNECT WI-FI", "SAVE CONTACT", "ORDER ONLINE"].map((preset) => (
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
            </TabsPanel>
          </Tabs>

          {/* Action Row: Save Campaign */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Ready for production deployment
            </span>

            <Button
              onClick={handleSaveCampaign}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Saved Successfully!
                </>
              ) : saving ? (
                "Saving Campaign..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Sovereign Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Interactive QR Preview */}
      <div className="lg:col-span-5 sticky top-6">
        <div className="rounded-3xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl flex flex-col items-center">
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
