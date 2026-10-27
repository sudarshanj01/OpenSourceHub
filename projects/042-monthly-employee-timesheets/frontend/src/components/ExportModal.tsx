"use client";

import React, { useState } from "react";
import { Project, User } from "../lib/types";
import { api } from "../lib/api";
import { 
  Download, 
  X, 
  Calendar, 
  FileSpreadsheet, 
  Users, 
  FolderKanban,
  CheckCircle2
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  currentUser: User;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  users,
  currentUser,
}) => {
  const isAdmin = currentUser.role === "ADMIN";

  // Default to current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = now.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(endOfMonth);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number>(isAdmin ? 0 : currentUser.id);

  if (!isOpen) return null;

  const downloadUrl = api.getExportUrl({
    start_date: startDate,
    end_date: endDate,
    project_id: selectedProjectId > 0 ? selectedProjectId : undefined,
    user_id: isAdmin && selectedUserId > 0 ? selectedUserId : (!isAdmin ? currentUser.id : undefined),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Export Timesheets</h3>
              <p className="text-xs text-zinc-400">Payroll & Client Billing CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4 text-xs">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <label className="text-zinc-400 font-medium">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.client ? `(${p.client})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter (Admin only) */}
          {isAdmin && (
            <div>
              <label className="text-zinc-400 font-medium">Team Member</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>All Team Members</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* CSV Format Info */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
          <div className="font-semibold text-zinc-300">Generated CSV columns:</div>
          <div>Date, Employee Name, Email, Project, Code, Client, Billable, Start Time, End Time, Hours, Minutes, Description</div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <a
            href={downloadUrl}
            onClick={() => setTimeout(onClose, 500)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </a>
        </div>

      </div>
    </div>
  );
};
