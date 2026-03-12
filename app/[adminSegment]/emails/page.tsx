import { createClient } from "@/lib/supabase/server";
import EmailClient from "@/components/admin/EmailClient";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  const supabase = createClient();
  const [companiesRes, emailLogsRes] = await Promise.all([
    supabase.from("companies").select("id, name, owner_id").eq("status", "active"),
    supabase.from("email_logs").select("*").order("sent_at", { ascending: false }).limit(50),
  ]);
  return (
    <EmailClient
      companies={(companiesRes.data as Record<string, unknown>[]) || []}
      emailLogs={(emailLogsRes.data as Record<string, unknown>[]) || []}
    />
  );
}
