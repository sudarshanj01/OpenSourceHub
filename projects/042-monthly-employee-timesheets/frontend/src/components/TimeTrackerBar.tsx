"use client";

import React, { useState, useEffect } from "react";
import { Project } from "../lib/types";
import { 
  Play, 
  Square, 
  Plus, 
  Clock, 
  Tag, 
  DollarSign, 
  Calendar, 
  ChevronDown,
  Sparkles,
  Timer
} from "lucide-react";
import { formatDuration } from "../lib/utils";

interface TimeTrackerBarProps {
  projects: Project[];
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

export const TimeTrackerBar: React.FC<TimeTrackerBarProps> = ({ projects, onAddEntry }) => {
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [mode, setMode] = useState<"timeframe" | "duration" | "timer">("timeframe");
  
  // Time frame inputs (e.g. 10:00 to 11:00)
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  
  // Direct duration input (hours and minutes)
  const [durationHours, setDurationHours] = useState(1);
  const [durationMins, setDurationMins] = useState(0);

  // Date selection
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [billable, setBillable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Running Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Set default project when available
  useEffect(() => {
    if (projects.length > 0 && selectedProjectId === 0) {
      setSelectedProjectId(projects[0].id);
      setBillable(projects[0].billable);
    }
  }, [projects, selectedProjectId]);

  // Update billable state when project changes
  const handleProjectChange = (pid: number) => {
    setSelectedProjectId(pid);
    const p = projects.find((x) => x.id === pid);
    if (p) {
      setBillable(p.billable);
    }
  };

  // Live timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Calculate duration in minutes for timeframe mode
  const getCalculatedMinutes = (): number => {
    if (mode === "timer") {
      return Math.max(1, Math.round(timerSeconds / 60));
    }
    if (mode === "duration") {
      return durationHours * 60 + durationMins;
    }
    if (!startTime || !endTime) return 0;
    const [h1, m1] = startTime.split(":").map(Number);
    const [h2, m2] = endTime.split(":").map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // overnight
    return diff;
  };

  const handleStartTimer = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setStartTime(`${hh}:${mm}`);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handleStopTimer = async () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setEndTime(`${hh}:${mm}`);
    setIsTimerRunning(false);

    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    await submitEntryWithMinutes(minutes, startTime, `${hh}:${mm}`);
  };

  const submitEntryWithMinutes = async (mins: number, sTime: string, eTime: string) => {
    if (!selectedProjectId) {
      alert("Please select a project");
      return;
    }
    if (mins <= 0) {
      alert("Duration must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddEntry({
        project_id: selectedProjectId,
        date,
        start_time: sTime,
        end_time: eTime,
        duration_minutes: mins,
        description: description.trim() || "Work log",
        billable,
      });
      setDescription("");
      setTimerSeconds(0);
    } catch (err: any) {
      alert(err.message || "Failed to add time entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = getCalculatedMinutes();
    let sTime = startTime;
    let eTime = endTime;

    if (mode === "duration") {
      sTime = "";
      eTime = "";
    }

    await submitEntryWithMinutes(minutes, sTime, eTime);
  };

  const calculatedMinutes = getCalculatedMinutes();
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Format running stopwatch string HH:MM:SS
  const formatTimerDisplay = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md overflow-hidden p-3.5 sm:p-4">
      {/* Subtle Aceternity Top Shimmer Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

      {/* Mode Selector Tabs (Time Frame vs Duration vs Live Timer) */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
          <button
            type="button"
            onClick={() => { setMode("timeframe"); setIsTimerRunning(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === "timeframe"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time Frame (e.g. 10:00 - 11:00)</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("duration"); setIsTimerRunning(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === "duration"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Duration (e.g. 3 hours)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("timer")}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === "timer"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Stopwatch</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Tracker Controls Form */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        
        {/* Description Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="What have you worked on? (e.g. Reviewed PRs, Client Meeting, Backend Refactor)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-500 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Project Selector */}
        <div className="min-w-[180px] sm:min-w-[210px]">
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="w-full appearance-none bg-zinc-950/60 text-zinc-200 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-8 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value={0}>No projects assigned</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.client ? `(${p.client})` : ""}
                  </option>
                ))
              )}
            </select>
            {selectedProject && (
              <span
                className="absolute left-2.5 top-3.5 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ backgroundColor: selectedProject.color || "#6366f1" }}
              />
            )}
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Time Inputs based on Mode */}
        {mode === "timeframe" && (
          <div className="flex items-center space-x-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-1.5">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-medium">Start</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent text-sm text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <span className="text-zinc-500 px-1 font-bold">-</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-medium">End</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent text-sm text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <div className="pl-2 border-l border-zinc-800 flex flex-col justify-center min-w-[55px]">
              <span className="text-[10px] text-zinc-400 font-medium">Duration</span>
              <span className="text-xs font-semibold text-indigo-400 font-mono">
                {formatDuration(calculatedMinutes)}
              </span>
            </div>
          </div>
        )}

        {mode === "duration" && (
          <div className="flex items-center space-x-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-1.5">
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                max="24"
                value={durationHours}
                onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-zinc-800/80 rounded px-1.5 py-1 text-sm text-center text-zinc-200 focus:outline-none font-mono"
              />
              <span className="text-xs text-zinc-400">h</span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                max="59"
                value={durationMins}
                onChange={(e) => setDurationMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-12 bg-zinc-800/80 rounded px-1.5 py-1 text-sm text-center text-zinc-200 focus:outline-none font-mono"
              />
              <span className="text-xs text-zinc-400">m</span>
            </div>
          </div>
        )}

        {mode === "timer" && (
          <div className="flex items-center space-x-3 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2">
            <div className="font-mono text-base font-bold tracking-wider text-indigo-300">
              {formatTimerDisplay(timerSeconds)}
            </div>
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTimer}
                disabled={isSubmitting}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all animate-pulse"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop & Save</span>
              </button>
            )}
          </div>
        )}

        {/* Billable Toggle Button */}
        <button
          type="button"
          onClick={() => setBillable(!billable)}
          className={`p-2.5 rounded-xl border transition-all ${
            billable
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]"
              : "bg-zinc-950/60 text-zinc-500 border-zinc-800"
          }`}
          title={billable ? "Billable to client" : "Non-billable internal work"}
        >
          <DollarSign className="w-4 h-4" />
        </button>

        {/* Action Button (Add Entry) */}
        {mode !== "timer" && (
          <button
            type="submit"
            disabled={isSubmitting || calculatedMinutes <= 0}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        )}

      </form>
    </div>
  );
};
