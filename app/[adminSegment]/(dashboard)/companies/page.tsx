import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldOff, Server } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage({ params }: { params: { adminSegment: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/${params.adminSegment}/login`);
  }

  // Fetch all companies and their active plans
  const { data: companies } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      type,
      max_endpoints,
      endpoints_count,
      compliance_score,
      created_at,
      profiles (display_name, email),
      active_subscriptions (
        expires_at,
        subscription_plans (name)
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <AdminShell adminSegment={params.adminSegment}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Company Tenants</h1>
          <p className="text-sm font-medium text-gray-500">Manage all registered businesses and monitor their security posture.</p>
        </div>

        <Card className="bg-navy-900 border-white/10 overflow-hidden">
          <CardHeader className="bg-black/20 border-b border-white/5 py-4">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Active Environments
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/5">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company Info</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Industry</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Endpoints</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CSA Score</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Active Plan</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {companies?.map((company) => {
                  const owner = ((company.profiles as Record<string, unknown>[])?.[0]) as { display_name?: string; email?: string } || {};
                  const sub = ((company.active_subscriptions as Record<string, unknown>[])?.[0]) as { subscription_plans?: { name?: string } } | null;
                  const planName = sub?.subscription_plans?.name || "None";
                  
                  return (
                    <tr key={company.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{company.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{owner.display_name} <span className="text-gray-600">({owner.email})</span></p>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-300">
                        {company.type || "Other"}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-black/40 border-white/10 font-mono text-cyan-400 shadow-inner">
                          {company.endpoints_count || 0} / {company.max_endpoints || 5}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-orange-400 to-green-400" 
                               style={{ width: `${Math.max(10, company.compliance_score || 0)}%` }} 
                             />
                           </div>
                           <span className="text-xs font-bold text-gray-300">{company.compliance_score || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300 font-medium">
                        {planName}
                      </td>
                      <td className="p-4">
                        {sub ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-bold">
                            <Activity className="w-3 h-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-bold opacity-80">
                            <ShieldOff className="w-3 h-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
