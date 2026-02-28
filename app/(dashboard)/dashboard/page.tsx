/* eslint-disable @typescript-eslint/no-explicit-any */
import { SecurityStatusCard } from '@/components/dashboard/SecurityStatusCard';
import { LiveAlertTicker } from '@/components/dashboard/LiveAlertTicker';
import { ThreatFeedTable } from '@/components/dashboard/ThreatFeedTable';
import { ServerHealthChart } from '@/components/dashboard/ServerHealthChart';
import { AgentStatusList } from '@/components/dashboard/AgentStatusList';
import { getDashboardStats, getRecentAlerts, getAgents, syncWazuhAlerts, syncWazuhAgents } from '@/app/actions/dashboard';
import Link from 'next/link';
import { Alert, Agent } from '@/lib/types';

export default async function DashboardPage() {
  // Attempt to sync from Wazuh first
  // Note: in a real production app, this would be handled by a background worker/cron,
  // but triggering it on dashboard load ensures fresh data if environment vars are present.
  try {
      // Ignore errors silently for dashboard render, logging handled inside
      await syncWazuhAlerts();
      await syncWazuhAgents();
  } catch (e) {
      console.error("Wazuh sync failed on dashboard load", e);
  }

  const stats = await getDashboardStats() || { blocked: 0, online: 0, status: 'secure' };

  // Use unknown casting to avoid ESLint any errors
  const rawAlerts = await getRecentAlerts();
  const alerts: Alert[] = (rawAlerts as unknown[]).map((a) => {
      const alert = a as any;
      return {
        ...alert,
        created_at: alert.created_at,
        source_ip: alert.source_ip || undefined
      };
  });

  const rawAgents = await getAgents();
  const agents: Agent[] = (rawAgents as unknown[]).map((a) => {
      const agent = a as any;
      return {
        ...agent,
        ip_address: agent.ip_address || undefined,
        last_seen: agent.last_seen || undefined
      };
  });

  // Ensure status is valid for SecurityStatusCard
  const statusType: 'secure' | 'warning' | 'critical' =
      (stats.status === 'secure' || stats.status === 'warning' || stats.status === 'critical')
      ? stats.status
      : 'secure';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Unified Security Dashboard</h1>

      <LiveAlertTicker alerts={alerts} />

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <SecurityStatusCard status={statusType} blocked={stats.blocked} online={stats.online} />
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
