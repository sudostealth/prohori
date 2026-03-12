import { createClient } from "@/lib/supabase/server";
import BillingClient from "@/components/billing/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  const company = profile?.companies as Record<string, unknown> | null;

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const { data: activeSub } = await supabase
    .from("active_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("company_id", company?.id || "")
    .maybeSingle();

  const { data: latestRequest } = await supabase
    .from("subscription_requests")
    .select("*, subscription_plans(name)")
    .eq("company_id", company?.id || "")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Default to profile.company_id if companies joined fetch doesn't return properly, else empty string
  const resolvedCompanyId = (company?.id as string) || (profile?.company_id as string) || "";

  return (
    <BillingClient
      companyId={resolvedCompanyId}
      plans={plans || []}
      activeSub={activeSub}
      latestRequest={latestRequest}
    />
  );
}
