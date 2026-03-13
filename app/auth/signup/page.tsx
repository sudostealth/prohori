"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const COMPANY_TYPES = [
  "Technology", "Finance & Banking", "Healthcare", "Retail & E-commerce",
  "Manufacturing", "Education", "Legal", "Real Estate", "NGO / Non-profit", "Other"
];

interface PasswordCheck {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_CHECKS: PasswordCheck[] = [
  { label: "Minimum 8 characters", test: (p) => p.length >= 8 },
  { label: "1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "1 lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "1 number", test: (p) => /[0-9]/.test(p) },
  { label: "1 special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    ownerName: "",
    companyName: "",
    email: "",
    companyType: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = PASSWORD_CHECKS.filter((c) => c.test(form.password)).length;
  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const strengthColor = ["bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]", "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]", "bg-yellow-500", "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]", "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"][Math.max(0, passwordStrength - 1)] || "bg-white/10";
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email is required";
    if (!form.companyType) e.companyType = "Please select company type";
    if (passwordStrength < 5) e.password = "Password must meet all requirements";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setLoading(true);
    try {
      // 1. Securely register the user and company on the server
      const res = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          companyType: form.companyType,
          ownerName: form.ownerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register company and user");
      }

      // 2. Automatically log the user in after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        console.warn("Sign in error after registration:", signInError.message);
        setSuccess(true);
        setTimeout(() => {
           router.push("/auth/login?registered=true");
        }, 1500);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setGlobalError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#0A0F1C] pointer-events-none">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 90, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2], rotate: [0, -90, 0] }} 
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" 
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 my-8 pointer-events-auto"
      >
        {/* Logo */}
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
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-white mb-2 tracking-tight">Account Created!</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-400 text-sm mb-6 max-w-[250px]">Please check your email to verify your newly created account.</motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to login...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create your account</h1>
                <p className="text-gray-400 text-sm font-medium">Protect your business with enterprise-grade security</p>
              </div>

              <AnimatePresence>
                {globalError && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{globalError}</p>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Owner Name</label>
                    <input
                      className={`w-full h-12 bg-black/20 border rounded-xl px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block ${errors.ownerName ? "border-red-500/50" : "border-white/10"}`}
                      placeholder="Mohammed Rahman"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    />
                    {errors.ownerName && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.ownerName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Company Name</label>
                    <input
                      className={`w-full h-12 bg-black/20 border rounded-xl px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block ${errors.companyName ? "border-red-500/50" : "border-white/10"}`}
                      placeholder="Dhaka Tech Solutions Ltd."
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    />
                    {errors.companyName && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.companyName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Company Email</label>
                  <input
                    type="email"
                    className={`w-full h-12 bg-black/20 border rounded-xl px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block ${errors.email ? "border-red-500/50" : "border-white/10"}`}
                    placeholder="owner@yourcompany.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Company Type</label>
                  <div className={`relative w-full h-12 bg-black/20 border rounded-xl flex items-center transition-all ${errors.companyType ? "border-red-500/50" : "border-white/10 hover:border-white/20 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/50"}`}>
                    <select
                      className="w-full h-full bg-transparent border-none outline-none appearance-none px-4 text-sm text-white focus:ring-0"
                      value={form.companyType}
                      onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                    >
                      <option value="" disabled className="text-gray-500 bg-navy-900">Select industry...</option>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-navy-900">{t}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {errors.companyType && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.companyType}</p>}
                </div>

                <div className="space-y-2 border-t border-white/5 pt-6 mt-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full h-12 bg-black/20 border rounded-xl px-4 pr-11 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block ${errors.password ? "border-red-500/50" : "border-white/10"}`}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  <AnimatePresence>
                    {form.password && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-3 space-y-4 overflow-hidden px-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex gap-1.5 h-1.5 bg-black/30 rounded-full overflow-hidden">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`h-full flex-1 transition-colors duration-500 ${i <= passwordStrength ? strengthColor : "bg-transparent"}`}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] font-bold w-16 text-right uppercase tracking-wider ${passwordStrength >= 4 ? "text-green-400" : passwordStrength >= 2 ? "text-yellow-400" : "text-red-400"}`}>{strengthLabel}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                          {PASSWORD_CHECKS.map((check) => {
                            const passed = check.test(form.password);
                            return (
                              <div key={check.label} className="flex items-center gap-2">
                                {passed ? (
                                  <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-3 h-3 text-gray-600" />
                                  </div>
                                )}
                                <span className={`text-[11px] font-semibold leading-tight ${passed ? "text-green-400/90" : "text-gray-500"}`}>
                                  {check.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!form.password && errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      type={showConfirm ? "text" : "password"}
                      className={`w-full h-12 bg-black/20 border rounded-xl px-4 pr-11 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 block ${passwordsMismatch ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" : ""} ${passwordsMatch ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/50" : "border-white/10"}`}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {form.confirmPassword && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`text-[11px] font-bold pt-1 flex items-center gap-1.5 ml-1 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                        {passwordsMatch ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!form.confirmPassword && errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full h-12 mt-4 rounded-xl text-navy-900 font-bold text-base bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Getting Everything Ready...</span></>
                  ) : (
                    <span>Create Secure Account</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-sm font-medium text-gray-400 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors border-b border-transparent hover:border-cyan-400 pb-0.5">
            Sign in here
          </Link>
        </p>

        <p className="text-center text-[11px] font-medium text-gray-600 mt-6 px-4">
          By creating an account, you agree to our{" "}
          <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Terms of Service</span>{" "}
          and{" "}
          <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
