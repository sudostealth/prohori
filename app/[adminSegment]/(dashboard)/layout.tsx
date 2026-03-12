import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { adminSegment: string };
}) {
  const adminSegment = params.adminSegment;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@prohori.app";

  if (!user || user.email !== adminEmail) {
    redirect(`/${adminSegment}/login`);
  }

  // Render with AdminShell for authenticated admin pages
  return <AdminShell adminSegment={adminSegment}>{children}</AdminShell>;
}
