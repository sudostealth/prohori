import { createClient } from "@/lib/supabase/server";
import HRMClient from "@/components/hrm/HRMClient";

export const dynamic = "force-dynamic";

export default async function HRMPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  const company = profile?.companies as Record<string, unknown> | null;

  const { data: members } = await supabase
    .from("hrm_members")
    .select("*")
    .eq("company_id", company?.id || "")
    .order("created_at", { ascending: false });

  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("company_id", company?.id || "")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <HRMClient
      companyId={company?.id as string}
      members={members || []}
      auditLogs={auditLogs || []}
      currentUserRole={profile?.role as string}
    />
  );
}
