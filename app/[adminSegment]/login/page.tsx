"use client";
import { useState } from "react";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const adminSegment = process.env.NEXT_PUBLIC_ADMIN_SEGMENT || "hq";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user returned");
      }

      // Check NEXT_PUBLIC_ADMIN_EMAIL since this is a client component
      const allowedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@prohori.app";
      if (data.user.email !== allowedAdminEmail) {
        await supabase.auth.signOut();
        throw new Error("Access denied - not an admin account");
      }

      toast.success("Welcome back, Admin!");

      // Force a hard navigation to the root of the current domain.
      // The middleware handles rewriting "/" on hq.prohori.app to "/hq".
      // By using window.location.href, we bypass Next.js client-side router caches
      // which might incorrectly route us due to layout overlaps.
      const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "hq.prohori.app";
      if (typeof window !== "undefined" && (window.location.hostname === adminDomain || window.location.hostname.startsWith("hq.localhost"))) {
        window.location.href = `/`;
      } else {
        window.location.href = `/${adminSegment}`;
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-purple-600/30 border border-red-500/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest">Prohori HQ</p>
            <p className="text-sm font-semibold text-red-400">Admin Portal</p>
          </div>
        </div>

        <div className="glass-card p-7 border-red-500/10">
          <h1 className="text-xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-gray-500 text-xs mb-6">Restricted — authorized personnel only</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Email</label>
              <input type="email" className="input-field" placeholder="admin@prohori.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input-field pr-11"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500/80 to-purple-600/80 hover:from-red-500 hover:to-purple-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span>{loading ? "Authenticating..." : "Access Portal"}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          This portal is not publicly accessible. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
