import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { TopNav } from '@/components/layout/TopNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex text-text bg-background selection:bg-primary/30">
      <UserSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNav />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full space-y-8 pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
