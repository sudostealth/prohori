/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { AlertTriangle, Activity, Server, Shield, Crosshair, Clock, Globe, Loader2 } from "lucide-react";

interface DashboardMetricsProps {
  companyId: string;
  source: "log" | "wazuh";
  logId?: string;
}

export default function DashboardMetrics({ companyId, source, logId }: DashboardMetricsProps) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = `/api/dashboard-metrics?companyId=${companyId}&source=${source}${logId ? `&logId=${logId}` : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
        fetchData();
    }
  }, [companyId, source, logId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 glass-card">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="ml-3 text-gray-400">AI Analyzing {source === 'log' ? 'uploaded log' : 'server data'}...</span>
      </div>
    );
  }

  if (!data) return null;

  const { securityOverview, threatCategories, topMitreTactics, attackTimeline, systemHealthAlerts, topAttackerIps } = data;

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-4 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{securityOverview?.critical || 0}</p>
            <p className="text-xs text-gray-500">Critical Alerts</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{securityOverview?.high || 0}</p>
            <p className="text-xs text-gray-500">High Severity</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{securityOverview?.agentsAffected || 0}</p>
            <p className="text-xs text-gray-500">Agents Affected</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{securityOverview?.attackersIp?.length || 0}</p>
            <p className="text-xs text-gray-500">Attacker IPs</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Threat Categories Detected
          </h2>
          <div className="space-y-3">
            {threatCategories && threatCategories.length > 0 ? threatCategories.map((tc: Record<string, any>, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-300">{tc.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{tc.count}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${tc.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {tc.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No information found.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-orange-400" /> Top MITRE ATT&CK Tactics
          </h2>
          <div className="space-y-3">
            {topMitreTactics && topMitreTactics.length > 0 ? topMitreTactics.map((mt: Record<string, any>, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-300">{mt.tactic}</span>
                <span className="text-sm font-bold text-orange-400">{mt.count}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No information found.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Attack Timeline (Key Events)
          </h2>
          <div className="space-y-4">
            {attackTimeline && attackTimeline.length > 0 ? attackTimeline.map((at: Record<string, any>, i: number) => (
              <div key={i} className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-0 before:w-[2px] before:bg-white/10 last:before:hidden">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 z-10 ${
                  at.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                  at.status === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{at.time}</p>
                  <p className="text-sm text-gray-300 mt-0.5">{at.event}</p>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No information found.</p>}
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" /> System Health Alerts
              </h2>
              <div className="space-y-3">
                {systemHealthAlerts && systemHealthAlerts.length > 0 ? systemHealthAlerts.map((sh: Record<string, any>, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className={`w-2 h-2 rounded-full ${sh.severity === 'critical' ? 'bg-red-500' : sh.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-sm text-gray-300">{sh.alert}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No information found.</p>}
              </div>
           </div>

           <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Top Attacker IPs
              </h2>
              <div className="flex flex-wrap gap-2">
                {topAttackerIps && topAttackerIps.length > 0 ? topAttackerIps.map((ip: Record<string, any>, i: number) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 flex items-center gap-2">
                    {ip.ip} <span className="text-xs text-red-400 bg-red-500/10 px-1.5 rounded">{ip.count}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No information found.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
