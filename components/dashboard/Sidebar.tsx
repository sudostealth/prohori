'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Bot, 
  FileCheck, 
  Bug, 
  Users, 
  CreditCard,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Analyst', href: '/ai-analyst', icon: Bot },
  { name: 'Compliance', href: '/compliance', icon: FileCheck },
  { name: 'Bug Bounty', href: '/bug-bounty', icon: Bug },
  { name: 'HRM', href: '/hrm', icon: Users },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

const bottomNavItems = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-2 border-r border-border hidden md:flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <ShieldAlert className="w-6 h-6 text-primary mr-2" />
        <span className="font-display font-bold text-lg text-white">Prohori</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-surface hover:text-white'
                )}
              >
                <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary" : "text-text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-surface hover:text-white'
                )}
              >
                <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary" : "text-text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
