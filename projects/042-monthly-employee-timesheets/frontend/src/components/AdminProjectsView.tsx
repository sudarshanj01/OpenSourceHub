"use client";

import React, { useState } from "react";
import { Project, User } from "../lib/types";
import { 
  FolderKanban, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  DollarSign, 
  Check, 
  X,
  Clock,
  Briefcase
} from "lucide-react";
import { formatHoursDecimal } from "../lib/utils";

interface AdminProjectsViewProps {
  projects: Project[];
  allUsers: User[];
  onCreateProject: (data: Partial<Project>) => Promise<void>;
  onUpdateProject: (id: number, data: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: number) => Promise<void>;
}

const COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#14b8a6", // Teal
  "#84cc16", // Lime
];

export const AdminProjectsView: React.FC<AdminProjectsViewProps> = ({
  projects,
  allUsers,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [billable, setBillable] = useState(true);
  const [assignedUserIds, setAssignedUserIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setClient("");
    setCode("");
    setColor("#6366f1");
    setBillable(true);
    // Assign all employees by default
    setAssignedUserIds(allUsers.map((u) => u.id));
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingId(p.id);
    setName(p.name);
    setClient(p.client || "");
    setCode(p.code || "");
    setColor(p.color || "#6366f1");
    setBillable(p.billable);
    setAssignedUserIds(p.assigned_user_ids || []);
    setModalOpen(true);
  };

  const toggleUserAssignment = (userId: number) => {
    if (assignedUserIds.includes(userId)) {
      setAssignedUserIds(assignedUserIds.filter((id) => id !== userId));
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateProject(editingId, {
          name: name.trim(),
          client: client.trim(),
          code: code.trim(),
          color,
          billable,
          assigned_user_ids: assignedUserIds,
          is_active: true,
        });
      } else {
        await onCreateProject({
          name: name.trim(),
          client: client.trim(),
          code: code.trim(),
          color,
          billable,
          assigned_user_ids: assignedUserIds,
        });
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center">
            <FolderKanban className="w-5 h-5 text-indigo-400 mr-2" />
            Project Management & Assignments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create internal or client projects, configure billable rates, and assign team members.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Color indicator & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: project.color || "#6366f1" }}
                  />
                  {project.code && (
                    <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                      {project.code}
                    </span>
                  )}
                  {project.billable && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Billable
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    title="Edit Project"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${project.name}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Client */}
              <h3 className="text-base font-bold text-zinc-100 mt-3 truncate">{project.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center">
                <Briefcase className="w-3 h-3 mr-1 text-zinc-500" />
                {project.client || "Internal Operations"}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span>{project.assigned_user_ids?.length || 0} Members</span>
              </div>

              <div className="flex items-center space-x-1 font-mono font-semibold text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatHoursDecimal(project.total_hours_logged || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Project */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100">
              {editingId ? "Edit Project" : "Create New Project"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Client / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Project Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PRJ-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="text-xs text-zinc-400">Project Color</label>
                <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? "ring-2 ring-white scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full bg-transparent border-0 cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Billable Checkbox */}
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-0"
                />
                <span>Default as Billable project</span>
              </label>

              {/* Team Member Multi-select */}
              <div>
                <label className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Assign Team Members</span>
                  <span className="text-[11px] text-zinc-500">
                    {assignedUserIds.length} of {allUsers.length} assigned
                  </span>
                </label>
                <div className="mt-1.5 max-h-36 overflow-y-auto space-y-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  {allUsers.map((u) => {
                    const isAssigned = assignedUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleUserAssignment(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isAssigned
                            ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                            : "text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{u.name}</span>
                          <span className="text-zinc-500 ml-1.5">({u.email})</span>
                        </div>
                        {isAssigned && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {editingId ? "Update Project" : "Create Project"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
