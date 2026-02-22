'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  FileText, 
  Megaphone, 
  Mail, 
  Gift, 
  FileEdit, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { adminSegment: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${params.adminSegment}/login`);
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: `/${params.adminSegment}`, icon: LayoutDashboard, exact: true },
    { name: 'Users', href: `/${params.adminSegment}/users`, icon: Users },
    { name: 'Companies', href: `/${params.adminSegment}/companies`, icon: Building2 },
    { name: 'Subscriptions', href: `/${params.adminSegment}/subscriptions`, icon: CreditCard },
    { name: 'Revenue Analytics', href: `/${params.adminSegment}/revenue`, icon: BarChart3 },
    { name: 'Reports Center', href: `/${params.adminSegment}/reports`, icon: FileText },
    { name: 'Announcements', href: `/${params.adminSegment}/announcements`, icon: Megaphone },
    { name: 'Email Center', href: `/${params.adminSegment}/emails`, icon: Mail },
    { name: 'Promo Codes', href: `/${params.adminSegment}/promos`, icon: Gift },
    { name: 'Content Manager', href: `/${params.adminSegment}/content`, icon: FileEdit },
  ];

  const bottomNavItems = [
    { name: 'System Settings', href: `/${params.adminSegment}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex text-text bg-background admin-theme">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] border-r border-[#222222] hidden md:flex flex-col h-full sticky top-0 overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-[#222222] shrink-0 sticky top-0 bg-[#111111] z-10">
          <ShieldAlert className="w-6 h-6 text-primary mr-2" />
          <span className="font-display font-bold text-lg text-white tracking-widest">PROHORI ADMIN</span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col">
          <nav className="space-y-1 px-4 flex-1">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-muted hover:bg-[#222222] hover:text-white'
                  )}
                >
                  <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-[#222222]">
            <nav className="space-y-1">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-muted hover:bg-[#222222] hover:text-white'
                    )}
                  >
                    <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[#222222] bg-[#111111]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="font-medium text-text-muted hidden sm:block">Admin Console</div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-muted hover:text-white hover:bg-[#222222]">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
