import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { TopNav } from '@/components/layout/TopNav';
import { checkSubscriptionStatus } from '@/lib/subscription';
import { checkAgentStatus } from '@/app/actions/agent';
import { SubscriptionCheck } from '@/components/auth/SubscriptionCheck';
import { AgentConnectionCheck } from '@/components/auth/AgentConnectionCheck';

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

  // Fetch subscription
  const subscription = await checkSubscriptionStatus(supabase);

  // Fetch agent connection status
  // We need to handle if checkAgentStatus throws or returns null
  let agentStatus = null;
  try {
      // Create a specific function for layout that doesn't use 'use server' if needed,
      // but 'checkAgentStatus' in actions uses 'createServerClient' which is fine.
      // However, checkAgentStatus is an async function.
      const agent = await checkAgentStatus();
      if (agent) {
          agentStatus = agent.status;
      }
  } catch (e) {
      console.error("Failed to check agent status", e);
  }

  return (
    <div className="min-h-screen flex text-text bg-background selection:bg-primary/30">
      <UserSidebar />
      <SubscriptionCheck subscription={subscription} />
      <AgentConnectionCheck subscription={subscription} agentStatus={agentStatus} />

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
