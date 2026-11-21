"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@ui-sdk/react/button";
import { Input } from "@ui-sdk/react/input";
import { Field, FieldLabel, FieldDescription } from "@ui-sdk/react/field";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the campaign passcode.");
      return;
    }

    setLoading(true);
    // Redirect through the route handler with the passcode
    window.location.href = `/r/${slug}?passcode=${encodeURIComponent(passcode)}`;
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Passcode Protected</h1>
          <p className="text-sm text-slate-400 mt-1">
            This QR destination requires a security PIN to proceed.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-5">
          <Field className="space-y-2">
            <FieldLabel className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Campaign Passcode
            </FieldLabel>
            <Input
              type="password"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={(e: any) => {
                setPasscode(e.target.value);
                setError("");
              }}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-center tracking-widest text-lg font-mono"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
            <FieldDescription className="text-xs text-slate-500 text-center">
              Target code: <span className="font-mono text-slate-300">/r/{slug}</span>
            </FieldDescription>
          </Field>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? "Verifying..." : "Unlock Destination"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sovereign QRShield Host • No SaaS Intermediary</span>
        </div>
      </div>
    </div>
  );
}
