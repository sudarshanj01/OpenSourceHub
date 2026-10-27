"use client";

import React, { useState } from "react";
import { Project, TimeEntry } from "../lib/types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Calendar,
  CheckCircle2
} from "lucide-react";
import { formatDuration, getWeekRange } from "../lib/utils";

interface WeeklyTimesheetGridProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  entries: TimeEntry[];
  projects: Project[];
  dailyTargetHours: number;
  onAddEntry: (entry: {
    project_id: number;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    description: string;
    billable: boolean;
  }) => Promise<void>;
}

export const WeeklyTimesheetGrid: React.FC<WeeklyTimesheetGridProps> = ({
  currentDate,
  onDateChange,
  entries,
  projects,
  dailyTargetHours,
  onAddEntry,
}) => {
  const { monday, sunday, days } = getWeekRange(currentDate);

  // Quick Cell Log Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [targetDateStr, setTargetDateStr] = useState<string>("");
  const [modalHours, setModalHours] = useState(1);
  const [modalMins, setModalMins] = useState(0);
  const [modalDesc, setModalDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  const setToday = () => {
    onDateChange(new Date());
  };

  // Build matrix lookup: [projectId][dateStr] = total minutes
  const matrix: Record<number, Record<string, number>> = {};
  const dayTotals: Record<string, number> = {};
  const projectTotals: Record<number, number> = {};
  let grandTotalMins = 0;

  days.forEach((d) => {
    dayTotals[d.dateStr] = 0;
  });

  projects.forEach((p) => {
    matrix[p.id] = {};
    projectTotals[p.id] = 0;
    days.forEach((d) => {
      matrix[p.id][d.dateStr] = 0;
    });
  });

  entries.forEach((entry) => {
    if (matrix[entry.project_id] && matrix[entry.project_id][entry.date] !== undefined) {
      matrix[entry.project_id][entry.date] += entry.duration_minutes;
      projectTotals[entry.project_id] = (projectTotals[entry.project_id] || 0) + entry.duration_minutes;
      dayTotals[entry.date] = (dayTotals[entry.date] || 0) + entry.duration_minutes;
      grandTotalMins += entry.duration_minutes;
    }
  });

  const openLogModal = (proj: Project, dateStr: string) => {
    setTargetProject(proj);
    setTargetDateStr(dateStr);
    setModalHours(1);
    setModalMins(0);
    setModalDesc("");
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProject) return;
    const mins = modalHours * 60 + modalMins;
    if (mins <= 0) {
      alert("Duration must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddEntry({
        project_id: targetProject.id,
        date: targetDateStr,
        start_time: "",
        end_time: "",
        duration_minutes: mins,
        description: modalDesc.trim() || `Worked on ${targetProject.name}`,
        billable: targetProject.billable,
      });
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to log time");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rangeLabel = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Header Toolbar: Week Navigator & Totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={prevWeek}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextWeek}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={setToday}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            This Week
          </button>

          <div className="pl-3 text-sm font-semibold text-zinc-200 flex items-center">
            <Calendar className="w-4 h-4 text-indigo-400 mr-2" />
            {rangeLabel}
          </div>
        </div>

        {/* Weekly Total hours */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-zinc-400">Week Total:</span>
          <span className="text-sm font-bold font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
            {formatDuration(grandTotalMins)}
          </span>
          <span className="text-zinc-400 font-mono">
            ({(grandTotalMins / 60).toFixed(1)} hrs)
          </span>
        </div>
      </div>

      {/* Desktop Weekly Matrix Table */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-lg">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-900/90 text-xs font-semibold text-zinc-400 border-b border-zinc-800">
              <th className="py-3 px-4 w-72">Projects</th>
              {days.map((d) => {
                const isToday = new Date().toISOString().split("T")[0] === d.dateStr;
                return (
                  <th key={d.dateStr} className={`py-3 px-3 text-center ${isToday ? "text-indigo-400 bg-indigo-950/30 font-bold" : ""}`}>
                    <div>{d.dayName}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{d.dayNumber}</div>
                  </th>
                );
              })}
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-zinc-500">
                  No projects assigned. Contact your admin to get added to projects.
                </td>
              </tr>
            ) : (
              projects.map((proj) => {
                const projMins = projectTotals[proj.id] || 0;
                return (
                  <tr key={proj.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Project info cell */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: proj.color || "#6366f1" }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-200 truncate">{proj.name}</div>
                          {proj.client && (
                            <div className="text-[11px] text-zinc-400 truncate">{proj.client}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {days.map((d) => {
                      const mins = matrix[proj.id]?.[d.dateStr] || 0;
                      const hasHours = mins > 0;
                      return (
                        <td key={d.dateStr} className="p-1.5 text-center">
                          <button
                            onClick={() => openLogModal(proj, d.dateStr)}
                            className={`w-full py-2.5 px-1 rounded-xl text-xs font-mono transition-all flex flex-col items-center justify-center ${
                              hasHours
                                ? "bg-zinc-800 text-indigo-300 font-bold border border-zinc-700/60 shadow-sm"
                                : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50"
                            }`}
                            title={`Log time for ${proj.name} on ${d.dayName}`}
                          >
                            {hasHours ? (
                              formatDuration(mins)
                            ) : (
                              <Plus className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Project Weekly Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-200">
                      {formatDuration(projMins)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer: Column Totals */}
          <tfoot>
            <tr className="bg-zinc-900/90 font-semibold text-xs text-zinc-300 border-t border-zinc-800">
              <td className="py-3.5 px-4">Daily Totals</td>
              {days.map((d) => {
                const totalMins = dayTotals[d.dateStr] || 0;
                const totalHours = totalMins / 60;
                const meetsTarget = totalHours >= (dailyTargetHours || 8.0);
                return (
                  <td key={d.dateStr} className="py-3.5 px-3 text-center font-mono">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded ${
                        meetsTarget
                          ? "text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
                          : totalMins > 0
                          ? "text-zinc-200"
                          : "text-zinc-500"
                      }`}
                    >
                      {formatDuration(totalMins)}
                    </span>
                  </td>
                );
              })}
              <td className="py-3.5 px-4 text-right font-mono text-indigo-300 font-bold text-sm">
                {formatDuration(grandTotalMins)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card-Based Grid View */}
      <div className="block lg:hidden space-y-3">
        {days.map((d) => {
          const dayMins = dayTotals[d.dateStr] || 0;
          const dayHours = dayMins / 60;
          return (
            <div key={d.dateStr} className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                <span className="font-semibold text-zinc-200">
                  {d.dayName}, {d.dateStr}
                </span>
                <span className="font-mono font-bold text-indigo-400">
                  {formatDuration(dayMins)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {projects.map((p) => {
                  const m = matrix[p.id]?.[d.dateStr] || 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => openLogModal(p, d.dateStr)}
                      className={`p-2 rounded-lg text-left border text-xs flex flex-col justify-between ${
                        m > 0
                          ? "bg-zinc-800/90 border-zinc-700 text-zinc-200"
                          : "bg-zinc-950/40 border-zinc-850 text-zinc-400"
                      }`}
                    >
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="font-mono font-bold text-indigo-300 mt-1">
                        {m > 0 ? formatDuration(m) : "+ Log"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Quick Log Time on Project */}
      {modalOpen && targetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2.5"
                style={{ backgroundColor: targetProject.color }}
              />
              Log Hours on {targetProject.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Date: <span className="font-mono text-zinc-300">{targetDateStr}</span>
            </p>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Hours & Minutes</label>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={modalHours}
                      onChange={(e) => setModalHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-center text-zinc-100 font-mono"
                    />
                    <span className="text-xs text-zinc-400">hrs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={modalMins}
                      onChange={(e) => setModalMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-center text-zinc-100 font-mono"
                    />
                    <span className="text-xs text-zinc-400">mins</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Work Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint feature implementation, bug fixes..."
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (modalHours * 60 + modalMins <= 0)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
