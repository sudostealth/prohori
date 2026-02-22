'use client';

import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" className="text-text-muted hover:text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="hidden md:block">
        <h2 className="text-lg font-medium text-white">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-muted hidden sm:block">{userEmail}</span>
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 overflow-hidden" />
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-muted hover:text-white">
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
