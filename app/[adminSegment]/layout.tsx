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

  // If this is the login page, render WITHOUT AdminShell
  // The login page has its own layout in app/[adminSegment]/login/layout.tsx
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL || "";

  // Check if user is already logged in as admin - redirect to dashboard
  if (user && user.email === adminEmail) {
    redirect(`/${adminSegment}`);
  }

  // Render with AdminShell for authenticated admin pages
  return <AdminShell adminSegment={adminSegment}>{children}</AdminShell>;
}
