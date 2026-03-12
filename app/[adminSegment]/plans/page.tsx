import { createClient } from "@/lib/supabase/server";
import PlansClient from "@/components/admin/PlansClient";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const supabase = createClient();
  const [plansRes, couponsRes] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("sort_order"),
    supabase.from("coupon_codes").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <PlansClient
      plans={(plansRes.data as Record<string, unknown>[]) || []}
      coupons={(couponsRes.data as Record<string, unknown>[]) || []}
    />
  );
}
