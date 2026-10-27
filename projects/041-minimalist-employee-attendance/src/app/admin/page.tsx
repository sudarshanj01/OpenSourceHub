"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  LogOut,
  Users,
  Calendar,
  FileSpreadsheet,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Coffee,
  X,
  AlertTriangle,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface ShiftPolicy {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  halfDayHours: number;
  fullDayHours: number;
}

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  departmentId: string | null;
  department?: Department | null;
  hourlyWage: number;
  email?: string | null;
  phone?: string | null;
  avatarColor: string;
  isActive: boolean;
  currentStatus: string;
  todayAttendance?: {
    id: string;
    clockIn: string | null;
    clockOut: string | null;
    status: string;
    isLate: boolean;
    lateMinutes: number;
    totalWorkMinutes: number;
    totalBreakMinutes: number;
    notes?: string | null;
  } | null;
}

interface TimesheetReport {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  hourlyWage: number;
  daysPresent: number;
  daysLate: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  estimatedTotalPay: number;
}

interface TimesheetSummary {
  startDate: string;
  endDate: string;
  totalEmployees: number;
  totalGrossEstimatedPay: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalLateIncidents: number;
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

export default function AdminPage() {
  // Session Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPin, setAuthPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [authChecking, setAuthChecking] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"today" | "staff" | "timesheet" | "settings">("today");

  // Core Data
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shiftPolicy, setShiftPolicy] = useState<ShiftPolicy | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Timesheet State
  const [timesheetSummary, setTimesheetSummary] = useState<TimesheetSummary | null>(null);
  const [timesheetReports, setTimesheetReports] = useState<TimesheetReport[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  // Modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [adjustingAttendance, setAdjustingAttendance] = useState<{
    attendanceId?: string;
    employeeId: string;
    employeeName: string;
    clockIn: string;
    clockOut: string;
    status: string;
    notes: string;
  } | null>(null);

  // Employee Form State
  const [empCode, setEmpCode] = useState("");
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empDeptId, setEmpDeptId] = useState("");
  const [empPin, setEmpPin] = useState("");
  const [empWage, setEmpWage] = useState("20.00");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");

  // Settings Form State
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formTimezone, setFormTimezone] = useState("America/New_York");
  const [formCurrency, setFormCurrency] = useState("$");
  const [formKioskReset, setFormKioskReset] = useState(4);
  const [formBreakPunches, setFormBreakPunches] = useState(true);
  const [formSoundEffects, setFormSoundEffects] = useState(true);
  const [formShiftStart, setFormShiftStart] = useState("09:00");
  const [formShiftEnd, setFormShiftEnd] = useState("17:00");
  const [formGraceMinutes, setFormGraceMinutes] = useState(15);
  const [formNewAdminPin, setFormNewAdminPin] = useState("");
  const [settingsSavedMsg, setSettingsSavedMsg] = useState("");

  // Check sessionStorage on initial load
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("admin_session");
    if (sessionToken === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Settings & Employees
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, empRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/employees?activeOnly=false"),
      ]);

      const settingsData = await settingsRes.json();
      const empData = await empRes.json();

      if (settingsData.settings) {
        setSettings(settingsData.settings);
        setFormCompanyName(settingsData.settings.companyName);
        setFormTagline(settingsData.settings.tagline);
        setFormTimezone(settingsData.settings.timezone);
        setFormCurrency(settingsData.settings.currency);
        setFormKioskReset(settingsData.settings.kioskResetSeconds);
        setFormBreakPunches(settingsData.settings.allowBreakPunches);
        setFormSoundEffects(settingsData.settings.soundEffects);
      }
      if (settingsData.departments) setDepartments(settingsData.departments);
      if (settingsData.shiftPolicy) {
        setShiftPolicy(settingsData.shiftPolicy);
        setFormShiftStart(settingsData.shiftPolicy.startTime);
        setFormShiftEnd(settingsData.shiftPolicy.endTime);
        setFormGraceMinutes(settingsData.shiftPolicy.graceMinutes);
      }
      if (empData.employees) setEmployees(empData.employees);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Fetch Timesheet
  const fetchTimesheet = useCallback(async () => {
    try {
      const url = `/api/timesheet?startDate=${startDate}&endDate=${endDate}&departmentId=${selectedDeptFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.summary) setTimesheetSummary(data.summary);
      if (data.reports) setTimesheetReports(data.reports);
    } catch (err) {
      console.error("Failed to fetch timesheet", err);
    }
  }, [startDate, endDate, selectedDeptFilter]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "timesheet") {
      fetchTimesheet();
    }
  }, [isAuthenticated, activeTab, fetchTimesheet]);

  // Verify Admin PIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPin) return;

    setAuthChecking(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: authPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_session", "authenticated");
        setIsAuthenticated(true);
        setAuthPin("");
      } else {
        setAuthError(data.error || "Invalid PIN. Access denied.");
      }
    } catch {
      setAuthError("Failed to reach verification endpoint.");
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    setIsAuthenticated(false);
  };

  // Add / Edit Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empCode || !empName || !empRole) return;

    try {
      if (editingEmployee) {
        // PATCH
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeCode: empCode,
            name: empName,
            role: empRole,
            departmentId: empDeptId || null,
            hourlyWage: parseFloat(empWage),
            email: empEmail,
            phone: empPhone,
            ...(empPin && { pin: empPin }),
          }),
        });
        if (res.ok) {
          setEditingEmployee(null);
          fetchAllData();
        }
      } else {
        // POST
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeCode: empCode,
            name: empName,
            role: empRole,
            departmentId: empDeptId || null,
            pin: empPin || "1234",
            hourlyWage: parseFloat(empWage),
            email: empEmail,
            phone: empPhone,
            shiftPolicyId: shiftPolicy?.id || null,
          }),
        });
        if (res.ok) {
          setShowAddEmployeeModal(false);
          fetchAllData();
        }
      }
    } catch (err) {
      console.error("Error saving employee", err);
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpCode(emp.employeeCode);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpDeptId(emp.departmentId || "");
    setEmpWage((emp.hourlyWage || 20).toString());
    setEmpEmail(emp.email || "");
    setEmpPhone(emp.phone || "");
    setEmpPin("");
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setEmpCode(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setEmpName("");
    setEmpRole("");
    setEmpDeptId(departments[0]?.id || "");
    setEmpWage("22.50");
    setEmpEmail("");
    setEmpPhone("");
    setEmpPin("1234");
    setShowAddEmployeeModal(true);
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    try {
      const res = await fetch(`/api/employees/${deletingEmployee.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingEmployee(null);
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to delete employee", err);
    }
  };

  // Adjust Attendance Modal
  const handleSaveAdjustedAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingAttendance) return;

    try {
      const res = await fetch("/api/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: adjustingAttendance.attendanceId,
          employeeId: adjustingAttendance.employeeId,
          clockIn: adjustingAttendance.clockIn ? new Date(adjustingAttendance.clockIn).toISOString() : null,
          clockOut: adjustingAttendance.clockOut ? new Date(adjustingAttendance.clockOut).toISOString() : null,
          status: adjustingAttendance.status,
          notes: adjustingAttendance.notes,
        }),
      });
      if (res.ok) {
        setAdjustingAttendance(null);
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to save attendance adjustment", err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formCompanyName,
          tagline: formTagline,
          timezone: formTimezone,
          currency: formCurrency,
          kioskResetSeconds: formKioskReset,
          allowBreakPunches: formBreakPunches,
          soundEffects: formSoundEffects,
          shiftStartTime: formShiftStart,
          shiftEndTime: formShiftEnd,
          shiftGraceMinutes: formGraceMinutes,
          newAdminPin: formNewAdminPin || undefined,
        }),
      });

      if (res.ok) {
        setSettingsSavedMsg("Settings saved successfully!");
        setFormNewAdminPin("");
        setTimeout(() => setSettingsSavedMsg(""), 4000);
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  // Today metrics
  const todayMetrics = useMemo(() => {
    let present = 0;
    let late = 0;
    let onBreak = 0;
    let clockedOut = 0;

    for (const emp of employees) {
      if (emp.currentStatus === "CLOCKED_IN") present++;
      if (emp.todayAttendance?.isLate) late++;
      if (emp.currentStatus === "ON_BREAK") onBreak++;
      if (emp.currentStatus === "CLOCKED_OUT") clockedOut++;
    }

    return { present, late, onBreak, clockedOut, total: employees.length };
  }, [employees]);

  // UN-AUTHENTICATED STATE: Clean PIN Prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-black text-white">Manager Authentication</h1>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Enter your management access PIN to access timesheets and staff settings.
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="Enter Access PIN"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {authError && (
              <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authChecking || authPin.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {authChecking ? "Verifying..." : "Unlock Management Portal"}
            </button>

            <Link
              href="/"
              className="mt-2 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Kiosk
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED STATE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-white flex items-center gap-2">
              {settings?.companyName || "Attendance Manager"}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">{settings?.tagline || "Staff Management & Payroll Exporter"}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "today"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today&apos;s Log</span>
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "staff"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory</span>
          </button>
          <button
            onClick={() => setActiveTab("timesheet")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "timesheet"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Timesheet &amp; Payroll</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Lock / Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock / Logout</span>
        </button>
      </header>

      {/* Main Tab Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading management data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: TODAY'S ATTENDANCE LOG */}
            {activeTab === "today" && (
              <div className="flex flex-col gap-5">
                {/* Metrics Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-medium">Clocked In Today</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{todayMetrics.present}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-medium">Late Arrivals</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{todayMetrics.late}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-medium">Currently on Break</p>
                    <p className="text-2xl font-black text-indigo-400 mt-1">{todayMetrics.onBreak}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-medium">Total Active Staff</p>
                    <p className="text-2xl font-black text-slate-300 mt-1">{todayMetrics.total}</p>
                  </div>
                </div>

                {/* Today's Roster Table (Desktop) & Cards (Mobile) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-sm text-white">Today&apos;s Real-Time Attendance Ledger</h2>
                      <p className="text-xs text-slate-400">Real-time punch records and manual manager adjustments</p>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Employee</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Clock In</th>
                          <th className="px-4 py-3">Clock Out</th>
                          <th className="px-4 py-3">Break Time</th>
                          <th className="px-4 py-3">Net Work Time</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {employees.map((emp) => {
                          const att = emp.todayAttendance;
                          const inTime = att?.clockIn
                            ? new Date(att.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—";
                          const outTime = att?.clockOut
                            ? new Date(att.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—";

                          let statusBadge = (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold text-[11px]">
                              Not Clocked In
                            </span>
                          );

                          if (emp.currentStatus === "CLOCKED_IN") {
                            statusBadge = (
                              <span
                                className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                                  att?.isLate
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {att?.isLate ? `Late (+${att.lateMinutes}m)` : "On Time"}
                              </span>
                            );
                          } else if (emp.currentStatus === "ON_BREAK") {
                            statusBadge = (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[11px]">
                                On Break
                              </span>
                            );
                          } else if (emp.currentStatus === "CLOCKED_OUT") {
                            statusBadge = (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
                                Done
                              </span>
                            );
                          }

                          const workHrs = att?.totalWorkMinutes ? (att.totalWorkMinutes / 60).toFixed(1) : "0.0";
                          const breakMins = att?.totalBreakMinutes ? `${att.totalBreakMinutes}m` : "0m";

                          return (
                            <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-lg ${emp.avatarColor} flex items-center justify-center text-white font-bold text-xs`}
                                  >
                                    {emp.name[0]}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-100">{emp.name}</div>
                                    <div className="text-[11px] font-mono text-slate-400">{emp.employeeCode}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-300">{emp.department?.name || "General"}</td>
                              <td className="px-4 py-3">{statusBadge}</td>
                              <td className="px-4 py-3 font-mono text-slate-200">{inTime}</td>
                              <td className="px-4 py-3 font-mono text-slate-200">{outTime}</td>
                              <td className="px-4 py-3 font-mono text-slate-400">{breakMins}</td>
                              <td className="px-4 py-3 font-mono font-bold text-emerald-400">{workHrs} hrs</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() =>
                                    setAdjustingAttendance({
                                      attendanceId: att?.id,
                                      employeeId: emp.id,
                                      employeeName: emp.name,
                                      clockIn: att?.clockIn ? new Date(att.clockIn).toISOString().slice(0, 16) : "",
                                      clockOut: att?.clockOut ? new Date(att.clockOut).toISOString().slice(0, 16) : "",
                                      status: att?.status || "PRESENT",
                                      notes: att?.notes || "",
                                    })
                                  }
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors"
                                >
                                  Adjust
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View (Section 3B Standard) */}
                  <div className="block md:hidden divide-y divide-slate-800">
                    {employees.map((emp) => {
                      const att = emp.todayAttendance;
                      const inTime = att?.clockIn
                        ? new Date(att.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Not recorded";
                      const outTime = att?.clockOut
                        ? new Date(att.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Not recorded";

                      return (
                        <div key={emp.id} className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl ${emp.avatarColor} flex items-center justify-center text-white font-bold text-xs`}
                              >
                                {emp.name[0]}
                              </div>
                              <div>
                                <h3 className="font-bold text-xs text-white">{emp.name}</h3>
                                <p className="text-[11px] text-slate-400 font-mono">{emp.employeeCode}</p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setAdjustingAttendance({
                                  attendanceId: att?.id,
                                  employeeId: emp.id,
                                  employeeName: emp.name,
                                  clockIn: att?.clockIn ? new Date(att.clockIn).toISOString().slice(0, 16) : "",
                                  clockOut: att?.clockOut ? new Date(att.clockOut).toISOString().slice(0, 16) : "",
                                  status: att?.status || "PRESENT",
                                  notes: att?.notes || "",
                                })
                              }
                              className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Adjust
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Clock In:</span>
                              <span className="font-mono text-emerald-400 font-bold">{inTime}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Clock Out:</span>
                              <span className="font-mono text-slate-200">{outTime}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STAFF DIRECTORY */}
            {activeTab === "staff" && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-extrabold text-base text-white">Staff &amp; Employee Roster</h2>
                    <p className="text-xs text-slate-400">Manage employee PINs, hourly rates, and departments</p>
                  </div>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Staff</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Hourly Wage</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-300">{emp.employeeCode}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-md ${emp.avatarColor} flex items-center justify-center text-white font-bold text-[11px]`}
                                >
                                  {emp.name[0]}
                                </div>
                                <span className="font-bold text-slate-100">{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{emp.department?.name || "General"}</td>
                            <td className="px-4 py-3 text-slate-400">{emp.role}</td>
                            <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                              {settings?.currency || "$"}
                              {(emp.hourlyWage || 20).toFixed(2)}/hr
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {emp.phone || emp.email || "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                  title="Edit staff details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingEmployee(emp)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                  title="Remove employee"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block md:hidden divide-y divide-slate-800">
                    {employees.map((emp) => (
                      <div key={emp.id} className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl ${emp.avatarColor} flex items-center justify-center text-white font-bold text-xs`}
                            >
                              {emp.name[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-xs text-white">{emp.name}</h3>
                              <p className="text-[11px] text-slate-400">
                                {emp.role} • <span className="font-mono">{emp.employeeCode}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-2 rounded-lg bg-slate-800 text-slate-300"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingEmployee(emp)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl text-slate-400">
                          <span>Dept: {emp.department?.name || "General"}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {settings?.currency || "$"}
                            {(emp.hourlyWage || 20).toFixed(2)}/hr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TIMESHEET & PAYROLL */}
            {activeTab === "timesheet" && (
              <div className="flex flex-col gap-5">
                {/* Filter and Export Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                      <select
                        value={selectedDeptFilter}
                        onChange={(e) => setSelectedDeptFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Export and Print Buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <a
                      href={`/api/timesheet/export?startDate=${startDate}&endDate=${endDate}&departmentId=${selectedDeptFilter}`}
                      download
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </a>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Payroll Summary Cards */}
                {timesheetSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 font-medium">Estimated Gross Payroll</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        {settings?.currency || "$"}
                        {timesheetSummary.totalGrossEstimatedPay.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 font-medium">Total Man-Hours Logged</p>
                      <p className="text-2xl font-black text-white mt-1">
                        {timesheetSummary.totalWorkHours.toLocaleString()}h
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 font-medium">Overtime Hours</p>
                      <p className="text-2xl font-black text-indigo-400 mt-1">
                        {timesheetSummary.totalOvertimeHours}h
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 font-medium">Late Incidents</p>
                      <p className="text-2xl font-black text-amber-400 mt-1">
                        {timesheetSummary.totalLateIncidents}
                      </p>
                    </div>
                  </div>
                )}

                {/* Per-Employee Timesheet Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-sm text-white">Staff Timesheet Breakdown</h2>
                      <p className="text-xs text-slate-400">
                        Period: {startDate} to {endDate}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Staff Name</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Rate</th>
                          <th className="px-4 py-3">Days Worked</th>
                          <th className="px-4 py-3">Regular Hrs</th>
                          <th className="px-4 py-3">OT Hrs</th>
                          <th className="px-4 py-3">Total Hrs</th>
                          <th className="px-4 py-3 text-right">Est. Gross Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {timesheetReports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-850/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-400">{report.code}</td>
                            <td className="px-4 py-3 font-bold text-slate-100">{report.name}</td>
                            <td className="px-4 py-3 text-slate-300">{report.department}</td>
                            <td className="px-4 py-3 font-mono text-slate-400">
                              {settings?.currency || "$"}
                              {report.hourlyWage.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-200">{report.daysPresent}</td>
                            <td className="px-4 py-3 font-mono text-slate-300">{report.regularHours}h</td>
                            <td className="px-4 py-3 font-mono text-indigo-400">{report.overtimeHours}h</td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-100">{report.totalHours}h</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-right">
                              {settings?.currency || "$"}
                              {report.estimatedTotalPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SETTINGS & SHIFTS */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-3xl">
                {settingsSavedMsg && (
                  <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{settingsSavedMsg}</span>
                  </div>
                )}

                {/* Company & Kiosk Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <h2 className="font-extrabold text-sm text-white">Company &amp; Kiosk Display</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={formCompanyName}
                        onChange={(e) => setFormCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Tagline / Location</label>
                      <input
                        type="text"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Timezone</label>
                      <input
                        type="text"
                        value={formTimezone}
                        onChange={(e) => setFormTimezone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Kiosk Reset (Seconds)</label>
                      <input
                        type="number"
                        min={2}
                        max={15}
                        value={formKioskReset}
                        onChange={(e) => setFormKioskReset(parseInt(e.target.value) || 4)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="breakPunches"
                        checked={formBreakPunches}
                        onChange={(e) => setFormBreakPunches(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-950 border-slate-800 focus:ring-emerald-500"
                      />
                      <label htmlFor="breakPunches" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Allow Break Punches
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="soundEffects"
                        checked={formSoundEffects}
                        onChange={(e) => setFormSoundEffects(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-950 border-slate-800 focus:ring-emerald-500"
                      />
                      <label htmlFor="soundEffects" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Audio Chimes
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shift Schedule Policy */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <h2 className="font-extrabold text-sm text-white">Default Shift Policy &amp; Grace Period</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Shift Start Time (24h)</label>
                      <input
                        type="time"
                        value={formShiftStart}
                        onChange={(e) => setFormShiftStart(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Shift End Time (24h)</label>
                      <input
                        type="time"
                        value={formShiftEnd}
                        onChange={(e) => setFormShiftEnd(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Late Grace (Minutes)</label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={formGraceMinutes}
                        onChange={(e) => setFormGraceMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Update Admin PIN */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <h2 className="font-extrabold text-sm text-white">Update Manager Access PIN</h2>
                  <p className="text-xs text-slate-400">Leave blank if you do not wish to change your PIN</p>
                  <div className="max-w-xs">
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Enter new 4 to 6-digit PIN"
                      value={formNewAdminPin}
                      onChange={(e) => setFormNewAdminPin(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {(showAddEmployeeModal || editingEmployee) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddEmployeeModal(false);
                setEditingEmployee(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-white mb-4">
              {editingEmployee ? `Edit ${editingEmployee.name}` : "Add New Staff Member"}
            </h3>

            <form onSubmit={handleSaveEmployee} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Employee Code</label>
                <input
                  type="text"
                  required
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Role / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technician"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Department</label>
                  <select
                    value={empDeptId}
                    onChange={(e) => setEmpDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None / General</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {editingEmployee ? "New PIN (leave blank to keep)" : "4-Digit PIN"}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={empPin}
                    onChange={(e) => setEmpPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hourly Wage ({settings?.currency || "$"})</label>
                  <input
                    type="number"
                    step="0.50"
                    value={empWage}
                    onChange={(e) => setEmpWage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmployeeModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST ATTENDANCE RECORD */}
      {adjustingAttendance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setAdjustingAttendance(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-sm text-white mb-1">Adjust Today&apos;s Attendance</h3>
            <p className="text-slate-400 mb-4">{adjustingAttendance.employeeName}</p>

            <form onSubmit={handleSaveAdjustedAttendance} className="flex flex-col gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Clock In Time</label>
                <input
                  type="datetime-local"
                  value={adjustingAttendance.clockIn}
                  onChange={(e) =>
                    setAdjustingAttendance({ ...adjustingAttendance, clockIn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Clock Out Time</label>
                <input
                  type="datetime-local"
                  value={adjustingAttendance.clockOut}
                  onChange={(e) =>
                    setAdjustingAttendance({ ...adjustingAttendance, clockOut: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={adjustingAttendance.status}
                  onChange={(e) =>
                    setAdjustingAttendance({ ...adjustingAttendance, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRESENT">PRESENT (On Time)</option>
                  <option value="LATE">LATE</option>
                  <option value="HALF_DAY">HALF_DAY</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Adjustment Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Forgot phone, arrived at 9:00 AM"
                  value={adjustingAttendance.notes}
                  onChange={(e) =>
                    setAdjustingAttendance({ ...adjustingAttendance, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingAttendance(null)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE EMPLOYEE */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base">Remove Staff Member?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-white">{deletingEmployee.name}</strong> (
                {deletingEmployee.employeeCode})? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setDeletingEmployee(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
