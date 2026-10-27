"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Project, TimeEntry, CompanySettings, DashboardStats } from "../lib/types";
import { api, clearStoredAuth, getStoredToken } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { TimeTrackerBar } from "../components/TimeTrackerBar";
import { DailyTimesheetList } from "../components/DailyTimesheetList";
import { WeeklyTimesheetGrid } from "../components/WeeklyTimesheetGrid";
import { DashboardView } from "../components/DashboardView";
import { AdminProjectsView } from "../components/AdminProjectsView";
import { AdminTeamView } from "../components/AdminTeamView";
import { AdminSettingsView } from "../components/AdminSettingsView";
import { ExportModal } from "../components/ExportModal";
import { LoginView } from "../components/LoginView";
import { Clock, AlertCircle } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timesheet");

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    id: 1,
    company_name: "OpenSheets Organization",
    allowed_domain: "",
    work_days: "1,2,3,4,5",
    daily_target_hours: 8.0,
    created_at: "",
    updated_at: "",
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Date state for weekly matrix
  const [matrixDate, setMatrixDate] = useState(new Date());

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Check initial authentication
  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const user = await api.getMe();
      setCurrentUser(user);
    } catch {
      clearStoredAuth();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [checkAuth]);

  // Load all app data once authenticated
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [projData, timesheetData, settingsData, statsData] = await Promise.all([
        api.getProjects(),
        api.getTimesheets(),
        api.getSettings(),
        api.getDashboardStats(),
      ]);
      setProjects(projData || []);
      setEntries(timesheetData || []);
      if (settingsData) setSettings(settingsData);
      if (statsData) setStats(statsData);

      if (currentUser.role === "ADMIN") {
        const usersData = await api.getUsers();
        setAllUsers(usersData || []);
      }
    } catch (err) {
      console.error("Failed to load application data:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    setActiveTab("timesheet");
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleAddEntry = async (entry: {
    project_id: number;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    description: string;
    billable: boolean;
  }) => {
    await api.createTimeEntry(entry);
    await loadData();
  };

  const handleUpdateEntry = async (id: number, updated: Partial<TimeEntry>) => {
    await api.updateTimeEntry(id, updated);
    await loadData();
  };

  const handleDeleteEntry = async (id: number) => {
    await api.deleteTimeEntry(id);
    await loadData();
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    await api.createProject(data);
    await loadData();
  };

  const handleUpdateProject = async (id: number, data: Partial<Project>) => {
    await api.updateProject(id, data);
    await loadData();
  };

  const handleDeleteProject = async (id: number) => {
    await api.deleteProject(id);
    await loadData();
  };

  const handleCreateUser = async (data: { name: string; email: string; password: string; role?: any; project_ids?: number[] }) => {
    await api.createUser(data);
    await loadData();
  };

  const handleUpdateUser = async (id: number, data: Partial<User> & { password?: string; project_ids?: number[] }) => {
    await api.updateUser(id, data);
    await loadData();
  };

  const handleDeleteUser = async (id: number) => {
    await api.deleteUser(id);
    await loadData();
  };

  const handleUpdateSettings = async (data: Partial<CompanySettings>) => {
    const updated = await api.updateSettings(data);
    setSettings(updated);
    await loadData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading OpenSheets...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenExport={() => setExportModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Time Tracker Bar (Always visible on Timesheet & Matrix views) */}
        {(activeTab === "timesheet" || activeTab === "matrix") && (
          <TimeTrackerBar
            projects={projects}
            onAddEntry={handleAddEntry}
          />
        )}

        {/* Tab 1: Daily Timesheet Tracker View */}
        {activeTab === "timesheet" && (
          <DailyTimesheetList
            entries={entries}
            projects={projects}
            dailyTargetHours={settings.daily_target_hours || 8.0}
            onDeleteEntry={handleDeleteEntry}
            onUpdateEntry={handleUpdateEntry}
          />
        )}

        {/* Tab 2: Weekly Matrix Grid */}
        {activeTab === "matrix" && (
          <WeeklyTimesheetGrid
            currentDate={matrixDate}
            onDateChange={setMatrixDate}
            entries={entries}
            projects={projects}
            dailyTargetHours={settings.daily_target_hours || 8.0}
            onAddEntry={handleAddEntry}
          />
        )}

        {/* Tab 3: Analytics Dashboard */}
        {activeTab === "dashboard" && (
          <DashboardView
            stats={stats}
            user={currentUser}
          />
        )}

        {/* Tab 4: Admin - Projects Management */}
        {activeTab === "projects" && currentUser.role === "ADMIN" && (
          <AdminProjectsView
            projects={projects}
            allUsers={allUsers}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* Tab 5: Admin - Team Directory */}
        {activeTab === "team" && currentUser.role === "ADMIN" && (
          <AdminTeamView
            users={allUsers}
            projects={projects}
            allowedDomain={settings.allowed_domain}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* Tab 6: Admin - Settings & Working Days */}
        {activeTab === "settings" && currentUser.role === "ADMIN" && (
          <AdminSettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

      </main>

      {/* Export CSV Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        projects={projects}
        users={allUsers}
        currentUser={currentUser}
      />

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-5 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-300">OpenSheets</span>
            <span>— Precision Timesheets & Project Time Tracking</span>
          </div>
          <div className="text-zinc-500">
            © OpenSheets. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
