"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  Search,
  CheckCircle2,
  Coffee,
  LogOut,
  ShieldAlert,
  ArrowRight,
  Monitor,
  Lock,
  Sparkles,
  X,
  Delete,
} from "lucide-react";
import { playSuccessChime, playErrorBuzz } from "@/lib/audio";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  departmentId: string | null;
  department: Department | null;
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
  timezone: string;
  currency: string;
  kioskResetSeconds: number;
  allowBreakPunches: boolean;
  soundEffects: boolean;
}

export default function KioskPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Kiosk Modal state
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [pin, setPin] = useState("");
  const [punching, setPunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<{
    action: string;
    message: string;
    time: string;
    statusLabel: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Live clock tick
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, employeesRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/employees"),
      ]);
      const settingsData = await settingsRes.json();
      const employeesData = await employeesRes.json();

      if (settingsData.settings) setSettings(settingsData.settings);
      if (settingsData.departments) setDepartments(settingsData.departments);
      if (employeesData.employees) setEmployees(employeesData.employees);
    } catch (err) {
      console.error("Failed to load kiosk data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Headcount metrics
  const metrics = useMemo(() => {
    let working = 0;
    let onBreak = 0;
    let clockedOut = 0;
    let notIn = 0;

    for (const emp of employees) {
      if (emp.currentStatus === "CLOCKED_IN") working++;
      else if (emp.currentStatus === "ON_BREAK") onBreak++;
      else if (emp.currentStatus === "CLOCKED_OUT") clockedOut++;
      else notIn++;
    }

    return { working, onBreak, clockedOut, notIn, total: employees.length };
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDept = selectedDept === "all" || emp.departmentId === selectedDept;
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [employees, selectedDept, searchQuery]);

  // Handle Keypad input
  const handleKeypadPress = (digit: string) => {
    if (punching || successInfo) return;
    setErrorMsg("");
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (punching || successInfo) return;
    setErrorMsg("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    if (punching || successInfo) return;
    setErrorMsg("");
    setPin("");
  };

  // Close modal and reset
  const closeModal = useCallback(() => {
    setActiveEmployee(null);
    setPin("");
    setErrorMsg("");
    setSuccessInfo(null);
    setCountdown(null);
  }, []);

  // Auto-reset timer when success occurs
  useEffect(() => {
    if (!successInfo) return;

    const resetSecs = settings?.kioskResetSeconds || 4;
    setCountdown(resetSecs);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          closeModal();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [successInfo, settings, closeModal]);

  // Submit Punch
  const handlePunch = async (action: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT") => {
    if (!activeEmployee) return;
    if (pin.length < 4) {
      setErrorMsg("Please enter your 4-digit PIN");
      if (settings?.soundEffects) playErrorBuzz();
      return;
    }

    setPunching(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: activeEmployee.id,
          pin,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Punch failed. Check PIN.");
        if (settings?.soundEffects) playErrorBuzz();
        setPunching(false);
        return;
      }

      // Success! Play pleasant chime
      if (settings?.soundEffects) playSuccessChime();

      setSuccessInfo({
        action: data.action,
        message: data.message,
        time: data.time,
        statusLabel: data.statusLabel,
      });

      // Refresh employee list in background
      fetchData();
    } catch {
      setErrorMsg("Network error communicating with server");
      if (settings?.soundEffects) playErrorBuzz();
    } finally {
      setPunching(false);
    }
  };

  // Format digital clock
  const timeString = currentTime
    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const dateString = currentTime
    ? currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
    : "Loading date...";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header / Kiosk Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Company & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
            {settings?.companyName ? settings.companyName.charAt(0) : "A"}
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white flex items-center gap-2">
              {settings?.companyName || "Attendance Kiosk"}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Live Kiosk
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {settings?.tagline || "Staff Punch-In & Duty Clock"}
            </p>
          </div>
        </div>

        {/* Big Live Digital Clock */}
        <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-slate-700/50 rounded-2xl px-5 py-1.5 shadow-inner">
          <div className="flex items-center gap-2 font-mono text-xl md:text-2xl font-black tracking-widest text-emerald-400">
            <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>{timeString}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {dateString}
          </span>
        </div>

        {/* Action Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href="/board"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Monitor className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Floor Board</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Manager Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Headcount Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Clocked In Now</p>
              <p className="text-2xl font-extrabold text-emerald-400">{metrics.working}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              🟢
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">On Break</p>
              <p className="text-2xl font-extrabold text-amber-400">{metrics.onBreak}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Not In Yet</p>
              <p className="text-2xl font-extrabold text-slate-400">{metrics.notIn}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
              ⚪
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Done Today</p>
              <p className="text-2xl font-extrabold text-blue-400">{metrics.clockedOut}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              All Staff ({employees.length})
            </button>
            {departments.map((dept) => {
              const count = employees.filter((e) => e.departmentId === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedDept === dept.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {dept.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading roster & shift data...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No staff members found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? "Try searching for a different name or code" : "Add staff in the Manager Portal"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => {
              const initials = emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              // Status badges & text
              let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
              let badgeText = "Not Clocked In";
              let statusIndicator = "bg-slate-500";

              if (emp.currentStatus === "CLOCKED_IN") {
                badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                badgeText = emp.todayAttendance?.isLate ? "Clocked In (Late)" : "Clocked In";
                statusIndicator = "bg-emerald-400 animate-pulse";
              } else if (emp.currentStatus === "ON_BREAK") {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                badgeText = "On Break";
                statusIndicator = "bg-amber-400";
              } else if (emp.currentStatus === "CLOCKED_OUT") {
                badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                badgeText = "Clocked Out";
                statusIndicator = "bg-blue-400";
              }

              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    setActiveEmployee(emp);
                    setPin("");
                    setErrorMsg("");
                    setSuccessInfo(null);
                  }}
                  className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98] flex flex-col justify-between"
                >
                  {/* Top line: avatar + code + status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${emp.avatarColor} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                          {emp.name}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">{emp.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Department tag and code */}
                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800/60 my-1">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {emp.employeeCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {emp.department?.name || "General"}
                    </span>
                  </div>

                  {/* Bottom: Current Status & Punch CTA */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeColor}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusIndicator}`} />
                      <span>{badgeText}</span>
                    </div>

                    <span className="text-xs text-slate-400 group-hover:text-emerald-400 font-semibold flex items-center gap-1">
                      Punch <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Touch Numeric PIN Pad Modal */}
      {activeEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Employee Profile Header in Modal */}
            <div className="text-center flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-2xl ${activeEmployee.avatarColor} flex items-center justify-center text-white font-black text-lg shadow-lg mb-2`}
              >
                {activeEmployee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <h3 className="font-extrabold text-base text-white">{activeEmployee.name}</h3>
              <p className="text-xs text-slate-400">
                {activeEmployee.role} • <span className="font-mono">{activeEmployee.employeeCode}</span>
              </p>
            </div>

            {/* SUCCESS CELEBRATION VIEW */}
            {successInfo ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-5 text-center flex flex-col items-center gap-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-400 text-base">{successInfo.statusLabel}</h4>
                  <p className="text-xs text-slate-200 mt-1">{successInfo.message}</p>
                  <p className="text-[11px] font-mono text-emerald-300 mt-2">Time: {successInfo.time}</p>
                </div>

                {countdown !== null && (
                  <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden mt-2 border border-emerald-800/40">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${(countdown / (settings?.kioskResetSeconds || 4)) * 100}%`,
                      }}
                    />
                  </div>
                )}
                <button
                  onClick={closeModal}
                  className="mt-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Done (Reset Kiosk)
                </button>
              </div>
            ) : (
              <>
                {/* PIN Display Dots */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Enter 4-Digit Staff PIN</span>
                  <div className="flex items-center gap-3 my-1">
                    {[0, 1, 2, 3].map((idx) => {
                      const isFilled = pin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                            isFilled
                              ? "bg-emerald-400 border-emerald-300 scale-110 shadow-sm shadow-emerald-400/50"
                              : "bg-slate-800 border-slate-700"
                          }`}
                        />
                      );
                    })}
                  </div>
                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                {/* Numeric Keypad Grid (3 x 4) */}
                <div className="grid grid-cols-3 gap-2 px-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="keypad-btn h-14"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="keypad-btn h-14 text-sm font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress("0")}
                    className="keypad-btn h-14"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="keypad-btn h-14 text-rose-400"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                {/* Contextual Action Punch Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                  {activeEmployee.currentStatus === "NOT_CLOCKED_IN" && (
                    <button
                      type="button"
                      disabled={punching || pin.length < 4}
                      onClick={() => handlePunch("CLOCK_IN")}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{punching ? "Verifying..." : "Clock In (Start Work)"}</span>
                    </button>
                  )}

                  {activeEmployee.currentStatus === "CLOCKED_IN" && (
                    <div className="grid grid-cols-2 gap-2">
                      {settings?.allowBreakPunches && (
                        <button
                          type="button"
                          disabled={punching || pin.length < 4}
                          onClick={() => handlePunch("BREAK_START")}
                          className="py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                          <Coffee className="w-4 h-4" />
                          <span>Start Break</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={punching || pin.length < 4}
                        onClick={() => handlePunch("CLOCK_OUT")}
                        className={`py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
                          !settings?.allowBreakPunches ? "col-span-2" : ""
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Clock Out</span>
                      </button>
                    </div>
                  )}

                  {activeEmployee.currentStatus === "ON_BREAK" && (
                    <button
                      type="button"
                      disabled={punching || pin.length < 4}
                      onClick={() => handlePunch("BREAK_END")}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>End Break & Resume Work</span>
                    </button>
                  )}

                  {activeEmployee.currentStatus === "CLOCKED_OUT" && (
                    <button
                      type="button"
                      disabled={punching || pin.length < 4}
                      onClick={() => handlePunch("CLOCK_IN")}
                      className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Clock In Again (Extra Shift)</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
