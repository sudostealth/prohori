import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [companiesRes, activeSubs, pendingReqs, expiringSoon] = await Promise.all([
    supabase.from("companies").select("id, name, type, status, created_at").order("created_at", { ascending: false }),
    supabase.from("active_subscriptions").select("id, expires_at, subscription_plans(name), companies(name)"),
    supabase.from("subscription_requests").select("id, company_id, status, companies(name), subscription_plans(name)").eq("status", "pending"),
    supabase.from("active_subscriptions").select("id, expires_at, companies(name), subscription_plans(name)").lt("expires_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const companies = companiesRes.data || [];
  const stats = [
    { label: "Total Companies", value: companies.length, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Active Subscriptions", value: (activeSubs.data || []).length, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Pending Requests", value: (pendingReqs.data || []).length, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Expiring ≤7 days", value: (expiringSoon.data || []).length, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">Recent Companies</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Company</th><th>Type</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {companies.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td className="text-white font-medium text-sm">{c.name}</td>
                  <td className="text-xs">{c.type}</td>
                  <td><span className={`badge ${c.status === "active" ? "badge-green" : "badge-gray"}`}>{c.status}</span></td>
                  <td className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={4} className="text-center text-gray-600 py-8">No companies registered yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pending Requests */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">Pending Subscription Requests</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Company</th><th>Plan</th><th>Status</th></tr></thead>
            <tbody>
              {(pendingReqs.data || []).slice(0, 8).map((r) => (
                <tr key={r.id}>
                  <td className="text-white text-sm font-medium">{((r.companies as unknown) as Record<string,string>)?.name}</td>
                  <td className="text-xs text-gray-400">{((r.subscription_plans as unknown) as Record<string,string>)?.name}</td>
                  <td><span className="badge badge-orange">Pending</span></td>
                </tr>
              ))}
              {(pendingReqs.data || []).length === 0 && (
                <tr><td colSpan={3} className="text-center text-gray-600 py-8">No pending requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
