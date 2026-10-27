"use client";

import React, { useState } from "react";
import { CompanySettings } from "../lib/types";
import { 
  Settings, 
  Building2, 
  Globe, 
  Calendar, 
  Clock, 
  Save, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

interface AdminSettingsViewProps {
  settings: CompanySettings;
  onUpdateSettings: (data: Partial<CompanySettings>) => Promise<void>;
}

const WEEKDAYS = [
  { id: "1", label: "Mon", name: "Monday" },
  { id: "2", label: "Tue", name: "Tuesday" },
  { id: "3", label: "Wed", name: "Wednesday" },
  { id: "4", label: "Thu", name: "Thursday" },
  { id: "5", label: "Fri", name: "Friday" },
  { id: "6", label: "Sat", name: "Saturday" },
  { id: "0", label: "Sun", name: "Sunday" },
];

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [companyName, setCompanyName] = useState(settings.company_name || "Apex Studio Inc.");
  const [allowedDomain, setAllowedDomain] = useState(settings.allowed_domain || "");
  const [dailyTarget, setDailyTarget] = useState(settings.daily_target_hours || 8.0);
  const [workDays, setWorkDays] = useState<string[]>(
    (settings.work_days || "1,2,3,4,5").split(",")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDay = (dayId: string) => {
    if (workDays.includes(dayId)) {
      setWorkDays(workDays.filter((d) => d !== dayId));
    } else {
      setWorkDays([...workDays, dayId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      await onUpdateSettings({
        company_name: companyName.trim(),
        allowed_domain: allowedDomain.trim().toLowerCase(),
        daily_target_hours: Number(dailyTarget),
        work_days: workDays.join(","),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center">
          <Settings className="w-5 h-5 text-indigo-400 mr-2" />
          Company & Timesheet Policy Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure organization identity, email domain security, working days schedule, and standard daily hour benchmarks.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
            <span>Company timesheet policies updated successfully!</span>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-6 shadow-xl">
        
        {/* Company Name */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center">
            <Building2 className="w-4 h-4 text-indigo-400 mr-1.5" />
            Organization / Studio Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            required
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Displayed across timesheet reports, exports, and team dashboards.
          </p>
        </div>

        {/* Allowed Domain Restriction */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center">
            <Globe className="w-4 h-4 text-indigo-400 mr-1.5" />
            Restricted Corporate Email Domain (Optional)
          </label>
          <div className="relative mt-2">
            <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm font-mono">@</span>
            <input
              type="text"
              placeholder="e.g. acme.com or agency.io (leave blank to allow any email)"
              value={allowedDomain}
              onChange={(e) => setAllowedDomain(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            When configured, only employee accounts with this exact email domain can be added by admins or log in.
          </p>
        </div>

        {/* Daily Target Hours */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center">
            <Clock className="w-4 h-4 text-indigo-400 mr-1.5" />
            Standard Daily Target Work Hours
          </label>
          <div className="flex items-center space-x-3 mt-2">
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 8.0)}
              className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-center text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-zinc-400 font-medium">hours per working day</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Expected daily timesheet capacity (e.g. 8.0 hours = 40 hour work week).
          </p>
        </div>

        {/* Work Days Schedule */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center">
            <Calendar className="w-4 h-4 text-indigo-400 mr-1.5" />
            Official Working Days
          </label>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {WEEKDAYS.map((day) => {
              const isSelected = workDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center border ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                      : "bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  <span>{day.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Used to calculate weekly target hours and timesheet completeness.
          </p>
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
