import { createClient } from "@/lib/supabase/server";
import SubscriptionsClient from "@/components/admin/SubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const supabase = createClient();
  const { data: requests } = await supabase
    .from("subscription_requests")
    .select("*, companies(name), subscription_plans(name, price, billing_cycle)")
    .order("requested_at", { ascending: false });

  return <SubscriptionsClient requests={(requests as Record<string, unknown>[]) || []} />;
}
