"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Users,
  Coffee,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  department?: { id: string; name: string } | null;
  avatarColor: string;
  currentStatus: "NOT_CLOCKED_IN" | "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT";
  todayAttendance?: {
    clockIn: string | null;
    clockOut: string | null;
    status: string;
    isLate: boolean;
    lateMinutes: number;
    totalBreakMinutes: number;
  } | null;
}

interface CompanySettings {
  companyName: string;
  tagline: string;
}

export default function FloorBoardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Live second tick
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [empRes, setRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/settings"),
      ]);
      const empData = await empRes.json();
      const setData = await setRes.json();

      if (empData.employees) setEmployees(empData.employees);
      if (setData.settings) setSettings(setData.settings);
    } catch (err) {
      console.error("Failed to load floor board", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 12 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  const metrics = useMemo(() => {
    let working = 0;
    let onBreak = 0;
    let notIn = 0;
    let out = 0;

    for (const e of employees) {
      if (e.currentStatus === "CLOCKED_IN") working++;
      else if (e.currentStatus === "ON_BREAK") onBreak++;
      else if (e.currentStatus === "CLOCKED_OUT") out++;
      else notIn++;
    }

    return { working, onBreak, notIn, out, total: employees.length };
  }, [employees]);

  // Compute live elapsed time string
  const getElapsedTimeString = (clockInIso: string | null | undefined) => {
    if (!clockInIso || !currentTime) return "";
    const start = new Date(clockInIso).getTime();
    const now = currentTime.getTime();
    const diffMins = Math.max(0, Math.floor((now - start) / 60000));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m on shift`;
  };

  const timeString = currentTime
    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const dateString = currentTime
    ? currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              {settings?.companyName || "Company Roster"}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                Live Floor Board
              </span>
            </h1>
            <p className="text-xs text-slate-400">{settings?.tagline || "Real-time staff deployment"}</p>
          </div>
        </div>

        {/* Digital Clock Banner */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-2 rounded-2xl shadow-inner">
          <div className="text-right">
            <div className="flex items-center gap-2 font-mono text-xl md:text-2xl font-black text-emerald-400">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>{timeString}</span>
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">{dateString}</div>
          </div>
          <button
            onClick={() => loadData()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Headcount Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Clocked In Now</p>
            <p className="text-3xl font-black text-white mt-1">{metrics.working}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            🟢
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">On Break</p>
            <p className="text-3xl font-black text-white mt-1">{metrics.onBreak}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
            <Coffee className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Not Clocked In</p>
            <p className="text-3xl font-black text-white mt-1">{metrics.notIn}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xl">
            ⚪
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Shift Finished</p>
            <p className="text-3xl font-black text-white mt-1">{metrics.out}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Roster Cards Matrix */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
          {employees.map((emp) => {
            const isWorking = emp.currentStatus === "CLOCKED_IN";
            const isOnBreak = emp.currentStatus === "ON_BREAK";
            const isDone = emp.currentStatus === "CLOCKED_OUT";

            let borderStyle = "border-slate-800 bg-slate-900/60";
            if (isWorking) borderStyle = "border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5";
            if (isOnBreak) borderStyle = "border-amber-500/40 bg-amber-950/10";
            if (isDone) borderStyle = "border-blue-500/30 bg-blue-950/10";

            return (
              <div
                key={emp.id}
                className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${borderStyle}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${emp.avatarColor} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm text-white">{emp.name}</h2>
                        <p className="text-xs text-slate-400">{emp.role}</p>
                      </div>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {emp.employeeCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-800/60 text-slate-400">
                    <span>Dept: {emp.department?.name || "General"}</span>
                    {emp.todayAttendance?.clockIn && (
                      <span className="font-mono text-emerald-400">
                        In: {new Date(emp.todayAttendance.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isWorking && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {isOnBreak && <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                    {isDone && <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                    {!isWorking && !isOnBreak && !isDone && (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    )}

                    <span className="text-xs font-bold text-slate-200">
                      {isWorking && "On Duty"}
                      {isOnBreak && "On Break"}
                      {isDone && "Shift Ended"}
                      {!isWorking && !isOnBreak && !isDone && "Not Clocked In"}
                    </span>
                  </div>

                  {isWorking && (
                    <span className="text-xs font-mono text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {getElapsedTimeString(emp.todayAttendance?.clockIn)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
