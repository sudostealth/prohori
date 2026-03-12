import { createClient } from "@/lib/supabase/server";
import DashboardMain from "@/components/dashboard/DashboardMain";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  const company = profile?.companies as Record<string, unknown> | null;

  // Fetch security alerts
  const { data: alerts } = await supabase
    .from("security_alerts")
    .select("*")
    .eq("company_id", company?.id || "")
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch server metrics (latest per server)
  const { data: metrics } = await supabase
    .from("server_metrics")
    .select("*")
    .eq("company_id", company?.id || "")
    .order("recorded_at", { ascending: false })
    .limit(10);

  // Active subscription
  const { data: activeSub } = await supabase
    .from("active_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("company_id", company?.id || "")
    .maybeSingle();

  return (
    <DashboardMain
      company={company}
      alerts={alerts || []}
      metrics={metrics || []}
      activeSub={activeSub}
      serverConnected={(company?.server_connected as boolean) || false}
    />
  );
}
