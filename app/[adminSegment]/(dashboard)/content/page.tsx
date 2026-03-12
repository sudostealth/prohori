import { createClient } from "@/lib/supabase/server";
import ContentClient from "@/components/admin/ContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const supabase = createClient();
  const { data: content } = await supabase
    .from("platform_content")
    .select("*")
    .order("created_at", { ascending: false });
  return <ContentClient content={(content as Record<string, unknown>[]) || []} />;
}
