"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LayoutDashboard, Brain, Users, CreditCard, Settings,
  Bell, LogOut, Menu, X, AlertCircle, Clock, Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardShellProps {
  user: User;
  profile: Record<string, unknown> | null;
  activeSub: Record<string, unknown> | null;
  pendingReq: Record<string, unknown> | null;
  announcements: Record<string, unknown>[];
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/ai-analyst", label: "AI Analyst", icon: Brain },
  { href: "/dashboard/compliance", label: "Compliance", icon: Shield },
  { href: "/dashboard/endpoints", label: "Endpoints", icon: LayoutDashboard },
  { href: "/dashboard/hrm", label: "HRM & Access", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({
  user,
  profile,
  activeSub,
  pendingReq,
  announcements,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const company = profile?.companies as Record<string, unknown> | null;
  const displayName = (profile?.display_name as string) || user.email?.split("@")[0] || "User";
  const companyName = (company?.name as string) || "Your Company";

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const hasNoSub = !activeSub && !pendingReq;
  const hasPending = pendingReq && (pendingReq.status as string) === "pending";
  const hasRejected = pendingReq && (pendingReq.status as string) === "rejected";

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex flex-shrink-0 items-center gap-3 px-5 py-5 border-b border-white/5">
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          <Shield className="w-4 h-4 text-white" />
        </motion.div>
        <div>
          <span className="font-bold gradient-text-cyan tracking-wide">প্রহরী</span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold -mt-0.5">Security Suite</p>
        </div>
      </div>

      {/* Company info */}
      <div className="px-4 py-4 border-b border-white/5 flex-shrink-0">
        <div className="bg-white/5 rounded-xl px-3 py-3 flex items-center gap-3 border border-white/5 hover:border-cyan-500/30 transition-colors">
          <Avatar className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10 text-cyan-300">
            <AvatarFallback className="bg-transparent font-bold text-xs">{companyName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{companyName}</p>
            <p className="text-xs text-gray-500 truncate">{displayName}</p>
          </div>
          {activeSub && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 bg-green-500/10 text-green-400">
              {(activeSub.subscription_plans as Record<string, unknown>)?.name as string}
            </Badge>
          )}
        </div>
      </div>

      {/* Subscription alert */}
      <div className="flex-shrink-0">
        {hasNoSub && (
          <div className="mx-4 mt-4 mb-2">
            <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/20 text-orange-400 py-2.5 px-3">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <AlertTitle className="text-xs font-semibold mb-1">No Active Plan</AlertTitle>
              <AlertDescription className="text-[10px] leading-tight text-orange-300/80">
                Select a plan to unlock all functionality.
                <Link href="/dashboard/billing" className="block mt-1 text-orange-300 hover:text-orange-200 font-medium underline underline-offset-2">
                  View plans
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {hasPending && (
          <div className="mx-4 mt-4 mb-2">
            <Alert className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 py-2.5 px-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <AlertTitle className="text-xs font-semibold mb-0">Subscription Pending</AlertTitle>
              <AlertDescription className="text-[10px] mt-0.5 text-cyan-300/80">Awaiting admin approval</AlertDescription>
            </Alert>
          </div>
        )}
        {hasRejected && (
          <div className="mx-4 mt-4 mb-2">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 py-2.5 px-3">
              <X className="w-4 h-4 text-red-400" />
              <AlertTitle className="text-xs font-semibold mb-1">Request Rejected</AlertTitle>
              <AlertDescription className="text-[10px] leading-tight text-red-300/80">
                {(pendingReq?.rejection_reason as string) || "Contact support"}
                <Link href="/dashboard/billing" className="block mt-1 text-red-300 hover:text-red-200 font-medium underline underline-offset-2">
                  Try again
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && mounted && (
                <motion.div 
                  layoutId="activeSidebar"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-500 rounded-r-lg rounded-l-sm"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 flex-shrink-0 relative z-10 transition-colors ${active ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400"}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 flex-shrink-0">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950 text-gray-100 selection:bg-cyan-500/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col glass-card border-r border-y-0 rounded-none border-l-0 border-white/5 flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 glass-card rounded-none border-r border-white/10 flex-shrink-0 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-navy-900 overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 glass-card border-b border-white/5 border-t-0 border-x-0 rounded-none flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Announcement badge */}
            <AnimatePresence>
              {announcements.length > 0 && mounted && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 text-xs text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.05)]"
                >
                  <Zap className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
                  <span className="font-medium">{(announcements[0] as Record<string,unknown>)?.title as string}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10">
              <Bell className="w-4 h-4" />
              {announcements.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-500 border-2 border-navy-900 rounded-full animate-pulse" />
              )}
            </button>
            <Avatar className="w-8 h-8 rounded-full border border-white/10 ring-2 ring-transparent transition-all hover:ring-cyan-500/30 cursor-pointer">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth no-scrollbar relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
