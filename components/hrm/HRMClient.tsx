"use client";
import { useState } from "react";
import { Users, Plus, ShieldCheck, Activity, Mail, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface HRMClientProps {
  companyId: string;
  members: Record<string, unknown>[];
  auditLogs: Record<string, unknown>[];
  currentUserRole: string;
}

const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access except billing" },
  { value: "user", label: "User", desc: "Read + basic actions" },
  { value: "viewer", label: "Viewer", desc: "Read-only access" },
  { value: "researcher", label: "Researcher", desc: "Security research access" },
];

const ROLE_COLORS: Record<string, string> = {
  owner: "badge-cyan",
  admin: "badge-purple",
  user: "badge-green",
  viewer: "badge-gray",
  researcher: "badge-orange",
};

export default function HRMClient({ companyId, members, auditLogs, currentUserRole }: HRMClientProps) {
  const [activeTab, setActiveTab] = useState<"members" | "logs">("members");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "user" });
  const [inviting, setInviting] = useState(false);
  const supabase = createClient();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;
    setInviting(true);
    try {
      const { error } = await supabase.from("hrm_members").insert({
        company_id: companyId,
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role,
      });
      if (error) throw error;
      toast.success(`${inviteForm.name} added to your team!`);
      setShowInvite(false);
      setInviteForm({ name: "", email: "", role: "user" });
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setInviting(false);
    }
  };

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HRM & Access Control</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} team members across all roles</p>
        </div>
        {canManage && (
          <button onClick={() => setShowInvite(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /><span>Add Member</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/3 rounded-xl w-fit">
        {[
          { id: "members", label: "Team Members", icon: Users },
          { id: "logs", label: "Access Logs", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "members" | "logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members table */}
      {activeTab === "members" && (
        <div className="glass-card overflow-hidden overflow-x-auto">
          {members.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm mt-1">Add your first team member to get started</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5">
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  {canManage && <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((m) => (
                  <tr key={m.id as string} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-300">
                          {(m.name as string).charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm group-hover:text-cyan-400 transition-colors">{m.name as string}</p>
                          <p className="text-gray-600 text-xs">{m.email as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${ROLE_COLORS[m.role as string] || "badge-gray"}`}>
                        {m.role as string}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${m.is_active ? "badge-green" : "badge-gray"}`}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs font-medium">
                      {new Date(m.created_at as string).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="p-4">
                        <button className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === "logs" && (
        <div className="glass-card overflow-hidden overflow-x-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No access logs yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5">
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id as string} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white text-sm font-medium">{log.action as string}</td>
                    <td className="p-4 text-gray-400 text-xs">{(log.resource as string) || "—"}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{(log.ip_address as string) || "—"}</td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(log.created_at as string).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Add Team Member</h3>
                  <p className="text-xs text-gray-500">Invite someone to your security team</p>
                </div>
              </div>
              <button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="john@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role & Permissions</label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label key={role.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${inviteForm.role === role.value ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/5 hover:border-white/10"}`}>
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={inviteForm.role === role.value}
                        onChange={() => setInviteForm({ ...inviteForm, role: role.value })}
                        className="accent-cyan-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{role.label}</p>
                        <p className="text-xs text-gray-500">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={inviting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{inviting ? "Adding..." : "Add Member"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
