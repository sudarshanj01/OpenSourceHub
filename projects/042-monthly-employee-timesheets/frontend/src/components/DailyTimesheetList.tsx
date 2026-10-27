"use client";

import React, { useState } from "react";
import { Project, TimeEntry } from "../lib/types";
import { 
  Clock, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Briefcase, 
  Layers, 
  ChevronRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatDateLabel, formatDuration, formatTime12 } from "../lib/utils";

interface DailyTimesheetListProps {
  entries: TimeEntry[];
  projects: Project[];
  dailyTargetHours: number;
  onDeleteEntry: (id: number) => Promise<void>;
  onUpdateEntry: (id: number, updated: Partial<TimeEntry>) => Promise<void>;
}

export const DailyTimesheetList: React.FC<DailyTimesheetListProps> = ({
  entries,
  projects,
  dailyTargetHours,
  onDeleteEntry,
  onUpdateEntry,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editProjectId, setEditProjectId] = useState<number>(0);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDurationMins, setEditDurationMins] = useState(0);
  const [editBillable, setEditBillable] = useState(true);

  // Group entries by date
  const groupedByDate: Record<string, TimeEntry[]> = {};
  entries.forEach((e) => {
    if (!groupedByDate[e.date]) {
      groupedByDate[e.date] = [];
    }
    groupedByDate[e.date].push(e);
  });

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditProjectId(entry.project_id);
    setEditStartTime(entry.start_time);
    setEditEndTime(entry.end_time);
    setEditDurationMins(entry.duration_minutes);
    setEditBillable(entry.billable);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    let dur = editDurationMins;
    if (editStartTime && editEndTime) {
      const [h1, m1] = editStartTime.split(":").map(Number);
      const [h2, m2] = editEndTime.split(":").map(Number);
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff < 0) diff += 24 * 60;
      dur = diff;
    }

    await onUpdateEntry(id, {
      project_id: editProjectId,
      description: editDesc,
      start_time: editStartTime,
      end_time: editEndTime,
      duration_minutes: dur,
      billable: editBillable,
    });
    setEditingId(null);
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">No time entries recorded yet</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
          Use the time tracker bar above to log what you worked on today, choose a project, and record hours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((dateStr) => {
        const dayEntries = groupedByDate[dateStr];
        const dayTotalMins = dayEntries.reduce((acc, curr) => acc + curr.duration_minutes, 0);
        const dayTotalHours = dayTotalMins / 60;
        const targetPercent = Math.min(100, Math.round((dayTotalHours / (dailyTargetHours || 8.0)) * 100));

        return (
          <div
            key={dateStr}
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md backdrop-blur-sm overflow-hidden"
          >
            {/* Day Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/70 gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-zinc-100 flex items-center">
                  <Calendar className="w-4 h-4 text-indigo-400 mr-2" />
                  {formatDateLabel(dateStr)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">({dateStr})</span>
              </div>

              {/* Day Total & Progress against Daily Target */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-zinc-400">Total:</span>
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/30">
                    {formatDuration(dayTotalMins)}
                  </span>
                  <span className="text-zinc-400">/ {dailyTargetHours.toFixed(1)}h</span>
                </div>

                <div className="w-20 bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                  <div
                    className={`h-full transition-all ${
                      targetPercent >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${targetPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* List of Time Entries for this Day */}
            <div className="divide-y divide-zinc-800/60">
              {dayEntries.map((entry) => {
                const isEditing = editingId === entry.id;

                if (isEditing) {
                  return (
                    <div key={entry.id} className="p-4 bg-zinc-950/80 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs text-zinc-400">Description</label>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Project</label>
                          <select
                            value={editProjectId}
                            onChange={(e) => setEditProjectId(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-zinc-400">Start:</span>
                          <input
                            type="time"
                            value={editStartTime}
                            onChange={(e) => setEditStartTime(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-zinc-400">End:</span>
                          <input
                            type="time"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                          />
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-zinc-400">Mins:</span>
                          <input
                            type="number"
                            value={editDurationMins}
                            onChange={(e) => setEditDurationMins(Number(e.target.value))}
                            className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                          />
                        </div>

                        <label className="flex items-center space-x-1 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editBillable}
                            onChange={(e) => setEditBillable(e.target.checked)}
                            className="rounded bg-zinc-800 border-zinc-700 text-indigo-600"
                          />
                          <span>Billable</span>
                        </label>

                        <div className="ml-auto flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(entry.id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-zinc-800/30 transition-colors gap-3"
                  >
                    {/* Left: Project tag & description */}
                    <div className="flex items-start sm:items-center space-x-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0 shadow-sm"
                        style={{ backgroundColor: entry.project_color || "#6366f1" }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-200">
                            {entry.project_name || "Project"}
                          </span>
                          {entry.project_client && (
                            <span className="text-[11px] text-zinc-400 flex items-center">
                              • {entry.project_client}
                            </span>
                          )}
                          {entry.billable && (
                            <span className="inline-flex items-center text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              <DollarSign className="w-2.5 h-2.5 mr-0.5" /> Billable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300 truncate mt-0.5 max-w-xl">
                          {entry.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* Right: Time Span & Duration & Actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 pl-6 sm:pl-0">
                      {/* Time Range */}
                      <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                        {entry.start_time && entry.end_time ? (
                          <span>
                            {formatTime12(entry.start_time)} - {formatTime12(entry.end_time)}
                          </span>
                        ) : (
                          <span className="text-zinc-400">Direct Entry</span>
                        )}
                      </div>

                      {/* Duration Tag */}
                      <div className="font-mono text-xs font-bold text-zinc-100 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 min-w-[64px] text-center">
                        {formatDuration(entry.duration_minutes)}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this timesheet entry?")) {
                              onDeleteEntry(entry.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
