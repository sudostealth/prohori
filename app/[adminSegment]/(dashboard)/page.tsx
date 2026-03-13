import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [companiesRes] = await Promise.all([
    supabase.from("companies").select("id, name, type, status, created_at").order("created_at", { ascending: false }),
  ]);

  const companies = companiesRes.data || [];
  const activeCompanies = companies.filter(c => c.status === "active").length;
  const stats = [
    { label: "Total Companies", value: companies.length, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Active Companies", value: activeCompanies, color: "text-green-400", bg: "bg-green-500/10" },
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

      <div className="grid lg:grid-cols-1 gap-6">
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
      </div>
    </div>
  );
}
