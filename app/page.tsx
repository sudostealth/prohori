import { createClient } from "@/lib/supabase/server";
import LandingClient from "@/components/landing/LandingClient";
import type { SubscriptionPlan, PlatformContent } from "@/types";

export const dynamic = "force-dynamic";

async function getPublicPricingPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return (data as SubscriptionPlan[]) || [];
  } catch {
    return [];
  }
}

async function getLandingContent(): Promise<PlatformContent[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("platform_content")
      .select("*")
      .eq("is_published", true)
      .in("target", ["landing", "both"])
      .order("priority", { ascending: false });
    return (data as PlatformContent[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [plans, announcements] = await Promise.all([
    getPublicPricingPlans(),
    getLandingContent(),
  ]);
  return <LandingClient plans={plans} announcements={announcements} />;
}
