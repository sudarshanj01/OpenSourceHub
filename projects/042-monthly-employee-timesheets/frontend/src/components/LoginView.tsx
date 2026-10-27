"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-dot-pattern">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Aceternity Top Glowing Border */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_25px_-3px_rgba(99,102,241,0.5)] mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">OpenSheets</h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Timesheets & Project Time Tracking
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? "Signing In..." : "Sign In to OpenSheets"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
