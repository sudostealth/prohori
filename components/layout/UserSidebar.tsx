'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  BrainCircuit,
  FileCheck,
  Bug,
  Users,
  CreditCard,
  Bell,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Analyst', href: '/ai-analyst', icon: BrainCircuit },
    { name: 'Compliance', href: '/compliance', icon: FileCheck },
    { name: 'Bug Bounty', href: '/bug-bounty', icon: Bug },
    { name: 'HRM', href: '/hrm', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0 sticky top-0 bg-surface z-10">
        <ShieldCheck className="w-6 h-6 text-primary mr-2" />
        <span className="font-display font-bold text-lg text-white tracking-widest">PROHORI</span>
      </div>

      <div className="flex-1 py-6 flex flex-col">
        <nav className="space-y-1 px-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-surface-2 hover:text-white'
                )}
              >
                <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
