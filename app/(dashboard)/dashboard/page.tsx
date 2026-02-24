import { SecurityStatusCard } from '@/components/dashboard/SecurityStatusCard';
import { LiveAlertTicker } from '@/components/dashboard/LiveAlertTicker';
import { ThreatFeedTable } from '@/components/dashboard/ThreatFeedTable';
import { ServerHealthChart } from '@/components/dashboard/ServerHealthChart';
import { AgentStatusList } from '@/components/dashboard/AgentStatusList';
import { getDashboardStats, getRecentAlerts, getAgents } from '@/app/actions/dashboard';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getDashboardStats() || { blocked: 0, online: 0, status: 'secure' };
  const alerts = await getRecentAlerts();
  const agents = await getAgents();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Unified Security Dashboard</h1>

      <LiveAlertTicker />

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <SecurityStatusCard status={stats.status as any} blocked={stats.blocked} online={stats.online} />
        </div>
        <div className="md:col-span-1">
           {/* Quick Actions Placeholder */}
           <div className="glass-card p-6 h-full flex flex-col justify-center gap-4">
             <h3 className="text-lg font-bold font-display text-white">Quick Actions</h3>
             <button className="w-full py-3 bg-surface-2 hover:bg-surface text-white rounded-md text-sm font-medium transition-colors border border-border">
               Generate Report
             </button>
             <Link href="/connect-server" className="w-full">
                <button className="w-full py-3 bg-surface-2 hover:bg-surface text-white rounded-md text-sm font-medium transition-colors border border-border">
                Add New Agent
                </button>
             </Link>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ServerHealthChart />
          <ThreatFeedTable alerts={alerts} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <AgentStatusList agents={agents} />
        </div>
      </div>
    </div>
  );
}
