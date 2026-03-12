"use client";
import { useState } from "react";
import { Lock, Mail, Trash2, Eye, EyeOff, Loader2, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SettingsPageProps {
  companyName: string;
}

function SettingsCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function UserSettingsPage({ companyName }: SettingsPageProps) {
  const supabase = createClient();
  const router = useRouter();

  // Password
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error("New passwords do not match"); return; }
    if (pwForm.next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast.error("Invalid email address"); return; }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Verification sent to your new email!");
      setNewEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== companyName) { toast.error("Company name doesn't match"); return; }
    setDeleting(true);
    try {
      // Sign out and delete via API
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      await supabase.auth.signOut();
      toast.success("Account deleted. Goodbye.");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const PwInput = ({ field, placeholder }: { field: keyof typeof pwForm; placeholder: string }) => (
    <div className="relative">
      <input
        type={showPw[field] ? "text" : "password"}
        className="input-field pr-11"
        placeholder={placeholder}
        value={pwForm[field]}
        onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
      />
      <button
        type="button"
        onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
      >
        {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your credentials and account</p>
      </div>

      {/* Change Password */}
      <SettingsCard title="Change Password" icon={Lock}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
            <PwInput field="current" placeholder="Your current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
            <PwInput field="next" placeholder="New strong password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
            <PwInput field="confirm" placeholder="Repeat new password" />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50">
            {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{pwLoading ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </SettingsCard>

      {/* Change Email */}
      <SettingsCard title="Change Email" icon={Mail}>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="newemail@yourcompany.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500">A verification link will be sent to your new email address.</p>
          <button type="submit" disabled={emailLoading} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50">
            {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{emailLoading ? "Sending..." : "Send Verification"}</span>
          </button>
        </form>
      </SettingsCard>

      {/* Delete Account */}
      <SettingsCard title="Delete Account" icon={Trash2}>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">
            Deleting your account is <strong>permanent and irreversible</strong>. All your company data, server configurations, 
            and security logs will be permanently erased.
          </p>
        </div>
        <button onClick={() => setShowDelete(true)} className="btn-danger py-2.5 px-6 text-sm flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account Permanently
        </button>
      </SettingsCard>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Delete Account</h3>
                  <p className="text-xs text-red-400">This cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setShowDelete(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              To confirm deletion, type your company name exactly:
            </p>
            <div className="glass-card px-4 py-2 mb-4 font-mono text-sm text-red-300 border-red-500/20">
              {companyName}
            </div>
            <input
              className="input-field mb-6"
              placeholder="Type company name to confirm"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1 py-3">Cancel</button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== companyName || deleting}
                className="btn-danger flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? "Deleting..." : "Delete Forever"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
