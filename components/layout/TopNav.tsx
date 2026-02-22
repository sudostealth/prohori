'use client';

import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function TopNav() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error(error); // Log the error to use the variable
      toast.error('Error logging out');
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 w-full shrink-0">
      <div className="font-medium text-text-muted hidden sm:block">Unified Security Dashboard</div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-muted hover:text-white hover:bg-surface-2">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
