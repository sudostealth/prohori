import { createClient } from "@/lib/supabase/server";
import LandingClient from "@/components/landing/LandingClient";
import type { PlatformContent } from "@/types";

export const dynamic = "force-dynamic";

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
  const announcements = await getLandingContent();
  return <LandingClient plans={[]} announcements={announcements} />;
}
