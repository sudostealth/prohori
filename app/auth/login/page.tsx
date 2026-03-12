"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredMsg, setRegisteredMsg] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState(false);
  const adminSegment = process.env.NEXT_PUBLIC_ADMIN_SEGMENT || "hq";

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setRegisteredMsg(true);
    }
    if (searchParams.get("confirm") === "true") {
      setConfirmMsg(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      setSuccess(true);
      
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
      setTimeout(() => {
        if (data.user.email === adminEmail) {
          router.push(`/${adminSegment}`);
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setErrorMsg(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#0A0F1C]">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" 
      />
      
      {/* Fine Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.4)] mb-4"
          >
            <Shield className="w-7 h-7 text-white" />
          </motion.div>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 tracking-tight">Prohori</span>
          <p className="text-sm text-cyan-500/80 font-semibold uppercase tracking-widest mt-1">Security Suite</p>
        </div>

        <motion.div
           animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
           transition={{ duration: 0.4 }}
           className="relative"
        >
          <div className="bg-navy-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
            
            {/* Success Overlay */}
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 bg-[#0A0F1C]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-white mb-2">Login Successful</motion.h2>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to dashboard...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                <p className="text-gray-400 text-sm font-medium">Sign in to monitor your infrastructure</p>
              </div>

              <AnimatePresence>
                {registeredMsg && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Account created! You can now sign in.</p>
                      </div>
                   </motion.div>
                )}
                {confirmMsg && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Please check your email to confirm your account before logging in.</p>
                      </div>
                   </motion.div>
                )}
                {errorMsg && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{errorMsg}</p>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Company Email</label>
                  <input 
                    type="email" 
                    className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block" 
                    placeholder="owner@yourcompany.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    autoComplete="email" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                    <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium transition-colors">Forgot password?</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 pr-11 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || success} 
                  className="w-full h-12 mt-4 rounded-xl text-navy-900 font-bold text-base bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Authenticating...</span></> : <span>Secure Sign In</span>}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                {["End-to-end encrypted session", "Multi-factor auth ready", "CSA 2023 compliant"].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-xs font-medium text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-sm text-gray-400 mt-8 font-medium">
          New to Prohori?{" "}
          <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors border-b border-transparent hover:border-cyan-400 pb-0.5">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
