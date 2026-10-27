"use client";

import React from "react";
import { DashboardStats, User } from "../lib/types";
import { 
  Clock, 
  TrendingUp, 
  DollarSign, 
  FolderKanban, 
  Users, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { formatDuration, formatHoursDecimal } from "../lib/utils";

interface DashboardViewProps {
  stats: DashboardStats | null;
  user: User;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, user }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
        Loading analytics dashboard...
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const weeklyTarget = stats.target_hours_week || 40.0;
  const weeklyPercent = Math.min(100, Math.round((stats.week_hours / weeklyTarget) * 100));
  const billablePercent = stats.week_hours > 0 ? Math.round((stats.billable_hours / stats.week_hours) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Aceternity Bento Grid 4-Card Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Today's Hours</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100">
              {formatHoursDecimal(stats.today_hours)}
            </span>
            <span className="text-xs text-zinc-400">logged today</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-zinc-400">
            <span className="text-indigo-400 font-semibold mr-1">Daily Target:</span>
            <span>8.0 hrs</span>
          </div>
        </div>

        {/* Card 2: This Week */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Current Week</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100">
              {formatHoursDecimal(stats.week_hours)}
            </span>
            <span className="text-xs text-zinc-400">/ {weeklyTarget.toFixed(0)}h goal</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Billable Ratio */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Billable Ratio</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100">
              {billablePercent}%
            </span>
            <span className="text-xs text-zinc-400">of total time</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
            <span>{formatHoursDecimal(stats.billable_hours)} billable</span>
            <span>{formatHoursDecimal(stats.non_billable_hours)} non-billable</span>
          </div>
        </div>

        {/* Card 4: Month Total & Scope */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Month to Date</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100">
              {formatHoursDecimal(stats.month_hours)}
            </span>
            <span className="text-xs text-zinc-400">this month</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-zinc-400">
            <span className="text-emerald-400 font-semibold mr-1">{stats.total_projects} Active</span>
            <span>projects tracked</span>
          </div>
        </div>

      </div>

      {/* Visual Charts: Daily Distribution & Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Distribution Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center justify-between">
            <span>Weekly Hours by Day</span>
            <span className="text-xs text-zinc-400">Target: 8h/day</span>
          </h3>

          <div className="mt-6 flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-zinc-800">
            {stats.daily_hours.map((d) => {
              const maxScale = 12.0; // scale up to 12 hours
              const heightPercent = Math.min(100, Math.round((d.hours / maxScale) * 100));
              const isToday = new Date().toISOString().split("T")[0] === d.date;

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded mb-1 whitespace-nowrap">
                    {d.hours.toFixed(1)}h
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-zinc-800/80 rounded-t-lg relative flex items-end overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                          : d.hours >= 8.0
                          ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                          : "bg-gradient-to-t from-zinc-700 to-zinc-500"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span className={`text-xs mt-2 font-medium ${isToday ? "text-indigo-400 font-bold" : "text-zinc-400"}`}>
                    {d.day_of_week}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>Today</span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 ml-2" />
              <span>Target met (&gt;=8h)</span>
            </div>
            <span>Scale: 0h - 12h</span>
          </div>
        </div>

        {/* Project Breakdown (1 col) */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Hours by Project</h3>
            <p className="text-xs text-zinc-400 mt-1">Weekly percentage allocation</p>

            <div className="mt-5 space-y-4">
              {stats.project_breakdown.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">
                  No project hours recorded for this week
                </div>
              ) : (
                stats.project_breakdown.map((p) => (
                  <div key={p.project_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="font-medium text-zinc-200 truncate">{p.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-zinc-300 ml-2">
                        {p.hours.toFixed(1)}h ({p.percent.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${p.percent}%`,
                          backgroundColor: p.color || "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span>Total Projects Active:</span>
            <span className="font-mono font-bold text-zinc-200">{stats.project_breakdown.length}</span>
          </div>
        </div>

      </div>

      {/* Admin Team Breakdown Table */}
      {isAdmin && stats.user_breakdown && stats.user_breakdown.length > 0 && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center">
                <Users className="w-4 h-4 text-indigo-400 mr-2" />
                Team Timesheet Compliance (This Week)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Overview of hours logged per team member against the {weeklyTarget.toFixed(0)}h weekly target
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 border-b border-zinc-800">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Hours Logged</th>
                  <th className="py-2.5 px-3">Target Progress</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats.user_breakdown.map((u) => {
                  const p = Math.min(100, Math.round((u.hours / weeklyTarget) * 100));
                  const isComplete = u.hours >= weeklyTarget;

                  return (
                    <tr key={u.user_id} className="hover:bg-zinc-800/30">
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-200">{u.name}</div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-zinc-100">
                        {u.hours.toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-3 w-48">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isComplete ? "bg-emerald-500" : "bg-indigo-500"
                              }`}
                              style={{ width: `${p}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 w-8">{p}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isComplete ? (
                          <span className="inline-flex items-center text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> On Track
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
