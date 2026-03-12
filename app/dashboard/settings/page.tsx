import { createClient } from "@/lib/supabase/server";
import UserSettingsPage from "@/components/settings/UserSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(name)")
    .eq("id", user.id)
    .single();

  const company = profile?.companies as Record<string, unknown> | null;

  return <UserSettingsPage companyName={(company?.name as string) || "My Company"} />;
}
