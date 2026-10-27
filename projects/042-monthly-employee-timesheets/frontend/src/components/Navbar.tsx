"use client";

import React, { useState } from "react";
import { User } from "../lib/types";
import { 
  Clock, 
  LayoutGrid, 
  BarChart3, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut, 
  Download,
  Menu,
  X,
  Shield,
  Briefcase
} from "lucide-react";

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenExport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  const navItems = [
    { id: "timesheet", label: "Timesheet", icon: Clock },
    { id: "matrix", label: "Weekly Grid", icon: LayoutGrid },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    ...(isAdmin
      ? [
          { id: "projects", label: "Projects", icon: FolderKanban },
          { id: "team", label: "Team", icon: Users },
          { id: "settings", label: "Settings", icon: Settings },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">OpenSheets</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Export CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
              title="Export Timesheets to CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>

            {/* User Pill */}
            <div className="flex items-center pl-2 space-x-2.5 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">{user.name}</span>
                <span className="flex items-center text-[10px] text-zinc-400">
                  {isAdmin ? (
                    <span className="flex items-center text-amber-400 font-medium">
                      <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                    </span>
                  ) : (
                    <span className="flex items-center text-indigo-400 font-medium">
                      <Briefcase className="w-2.5 h-2.5 mr-0.5" /> Staff
                    </span>
                  )}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-sm">
            <div>
              <div className="font-semibold text-zinc-200">{user.name}</div>
              <div className="text-xs text-zinc-400">{user.email} ({user.role})</div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-zinc-900/80 text-zinc-300 border border-zinc-800/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onOpenExport();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-zinc-200 border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV Payroll</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
