import { SecurityStatusCard } from '@/components/dashboard/SecurityStatusCard';
import { LiveAlertTicker } from '@/components/dashboard/LiveAlertTicker';
import { ThreatFeedTable } from '@/components/dashboard/ThreatFeedTable';
import { ServerHealthChart } from '@/components/dashboard/ServerHealthChart';
import { AgentStatusList } from '@/components/dashboard/AgentStatusList';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Unified Security Dashboard</h1>

      <LiveAlertTicker />

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <SecurityStatusCard status="secure" blocked={142} online={3} />
        </div>
        <div className="md:col-span-1">
           {/* Quick Actions Placeholder */}
           <div className="glass-card p-6 h-full flex flex-col justify-center gap-4">
             <h3 className="text-lg font-bold font-display text-white">Quick Actions</h3>
             <button className="w-full py-3 bg-surface-2 hover:bg-surface text-white rounded-md text-sm font-medium transition-colors border border-border">
               Generate Report
             </button>
             <button className="w-full py-3 bg-surface-2 hover:bg-surface text-white rounded-md text-sm font-medium transition-colors border border-border">
               Add New Agent
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ServerHealthChart />
          <ThreatFeedTable />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <AgentStatusList />
        </div>
      </div>
    </div>
  );
}
