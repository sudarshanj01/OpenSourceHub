"use client";

import React, { useState } from "react";
import { Project, Role, User } from "../lib/types";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Briefcase, 
  Trash2, 
  Edit3, 
  Key, 
  Check, 
  Mail,
  Clock,
  Layers,
  AlertCircle
} from "lucide-react";
import { formatHoursDecimal } from "../lib/utils";

interface AdminTeamViewProps {
  users: User[];
  projects: Project[];
  allowedDomain: string;
  onCreateUser: (data: { name: string; email: string; password: string; role?: Role; project_ids?: number[] }) => Promise<void>;
  onUpdateUser: (id: number, data: Partial<User> & { password?: string; project_ids?: number[] }) => Promise<void>;
  onDeleteUser: (id: number) => Promise<void>;
}

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  users,
  projects,
  allowedDomain,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [isActive, setIsActive] = useState(true);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setEmail(allowedDomain ? `@${allowedDomain}` : "");
    setPassword("");
    setRole("EMPLOYEE");
    setIsActive(true);
    setSelectedProjectIds(projects.map((p) => p.id));
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword(""); // leave blank unless updating
    setRole(u.role);
    setIsActive(u.is_active);
    setSelectedProjectIds(u.assigned_project_ids || []);
    setErrorMsg("");
    setModalOpen(true);
  };

  const toggleProject = (pid: number) => {
    if (selectedProjectIds.includes(pid)) {
      setSelectedProjectIds(selectedProjectIds.filter((id) => id !== pid));
    } else {
      setSelectedProjectIds([...selectedProjectIds, pid]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required");
      return;
    }

    if (!editingId && !password) {
      setErrorMsg("Password is required for new accounts");
      return;
    }

    if (allowedDomain) {
      const parts = email.trim().toLowerCase().split("@");
      if (parts.length !== 2 || parts[1] !== allowedDomain.toLowerCase()) {
        setErrorMsg(`Email must match company domain: @${allowedDomain}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateUser(editingId, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password ? password.trim() : undefined,
          role,
          is_active: isActive,
          project_ids: selectedProjectIds,
        });
      } else {
        await onCreateUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
          project_ids: selectedProjectIds,
        });
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save user");
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
            <Users className="w-5 h-5 text-indigo-400 mr-2" />
            Team Directory & Employee Logins
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Add team members, configure email credentials, and assign project access permissions.
            {allowedDomain && (
              <span className="ml-1 text-indigo-400 font-medium">
                (Enforcing company domain @{allowedDomain})
              </span>
            )}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Team Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-900/90 text-xs font-semibold text-zinc-400 border-b border-zinc-800">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Projects</th>
                <th className="py-3.5 px-4">Total Logged</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((u) => {
                const assignedCount = u.assigned_project_ids?.length || 0;
                return (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100">{u.name}</div>
                          <div className="text-xs text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Shield className="w-3 h-3 mr-1" /> Admin / HR
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          <Briefcase className="w-3 h-3 mr-1" /> Employee
                        </span>
                      )}
                    </td>

                    {/* Assigned Projects */}
                    <td className="py-3 px-4">
                      <span className="text-xs text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 font-mono">
                        {assignedCount} {assignedCount === 1 ? "project" : "projects"}
                      </span>
                    </td>

                    {/* Total Logged Hours */}
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-200">
                      {formatHoursDecimal(u.total_hours_logged || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center text-xs text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-zinc-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-zinc-600 mr-1.5" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove team member "${u.name}"?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Employee */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100">
              {editingId ? "Edit Team Member" : "Add New Employee Account"}
            </h3>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Email Address * {allowedDomain && <span className="text-indigo-400 font-mono">(@{allowedDomain})</span>}
                </label>
                <input
                  type="email"
                  placeholder={allowedDomain ? `employee@${allowedDomain}` : "employee@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  {editingId ? "Reset Password (leave blank to keep unchanged)" : "Temporary Password *"}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? "••••••••" : "Enter temporary password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required={!editingId}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EMPLOYEE">Employee (Timesheets)</option>
                    <option value="ADMIN">HR / Employer (Admin)</option>
                  </select>
                </div>

                {editingId && (
                  <div>
                    <label className="text-xs text-zinc-400">Account Status</label>
                    <select
                      value={isActive ? "true" : "false"}
                      onChange={(e) => setIsActive(e.target.value === "true")}
                      className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Deactivated</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Project Assignments */}
              <div>
                <label className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Assign to Projects</span>
                  <span className="text-[11px] text-zinc-500">
                    {selectedProjectIds.length} of {projects.length} selected
                  </span>
                </label>
                <div className="mt-1.5 max-h-36 overflow-y-auto space-y-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  {projects.map((p) => {
                    const isSelected = selectedProjectIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProject(p.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                            : "text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="font-semibold">{p.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
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
                  {editingId ? "Save Changes" : "Create Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
