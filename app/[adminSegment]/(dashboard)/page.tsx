// import { StatsGrid } from '@/components/admin/StatsGrid';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-text-muted mb-8">Platform overview and centralized command center.</p>
      
      {/* KPI Stats placeholder - real component built in Phase 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass-card p-6">
            <h3 className="text-text-muted text-sm font-medium">Total Companies</h3>
            <p className="text-2xl font-semibold text-white mt-2">--</p>
         </div>
         <div className="glass-card p-6">
            <h3 className="text-text-muted text-sm font-medium">Monthly Revenue</h3>
            <p className="text-2xl font-semibold text-white mt-2">৳ --</p>
         </div>
         <div className="glass-card p-6">
            <h3 className="text-text-muted text-sm font-medium">Active Subs</h3>
            <p className="text-2xl font-semibold text-white mt-2">--</p>
         </div>
         <div className="glass-card p-6 border-red-500/30">
            <h3 className="text-text-muted text-sm font-medium">Critical Alerts</h3>
            <p className="text-2xl font-semibold text-red-500 mt-2">--</p>
         </div>
      </div>
    </div>
  );
}
