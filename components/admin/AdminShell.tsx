"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield, LayoutDashboard, CreditCard, Package, FileText,
  Mail, Building2, LogOut, ChevronRight, Menu, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminShellProps {
  adminSegment: string;
  children: React.ReactNode;
}

export default function AdminShell({ adminSegment, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const BASE = `/${adminSegment}`;
  const NAV = [
    { href: BASE, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${BASE}/companies`, label: "Companies", icon: Building2 },
    { href: `${BASE}/subscriptions`, label: "Subscriptions", icon: CreditCard },
    { href: `${BASE}/plans`, label: "Plans & Coupons", icon: Package },
    { href: `${BASE}/content`, label: "Content", icon: FileText },
    { href: `${BASE}/emails`, label: "Email Manager", icon: Mail },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${adminSegment}/login`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/60 to-purple-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-red-400">প্রহরী HQ</span>
          <p className="text-xs text-gray-600 -mt-0.5">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-link ${isActive(item.href, item.exact) ? "active" : ""}`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
            {isActive(item.href, item.exact) && <ChevronRight className="w-3 h-3 ml-auto" />}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/5">
        <button onClick={signOut} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/5">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex w-60 flex-col glass-card rounded-none border-r border-l-0 border-t-0 border-b-0 flex-shrink-0 border-red-500/10">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 glass-card rounded-none border-r"><SidebarContent /></aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs text-red-400 font-medium uppercase tracking-widest">Admin Portal</span>
          </div>
          <span className="text-xs text-gray-600">prohori.app/{adminSegment}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
