import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

const ADMIN_SEGMENT = process.env.NEXT_PUBLIC_ADMIN_URL_SEGMENT || 'admin-secret-portal';
const AUTHORIZED_EMAILS = (process.env.ADMIN_AUTHORIZED_EMAILS || '').split(',').map(e => e.trim());

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { adminSegment: string };
}) {
  // Verify URL segment matches exactly to prevent brute forcing
  if (params.adminSegment !== ADMIN_SEGMENT) {
    notFound();
  }

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If we are at the login page for admin, let it render
  
  if (!user) {
    // If we're not already on the login page, redirect there
    // We handle this via middleware mostly, but just to be safe:
    redirect(`/${ADMIN_SEGMENT}/login`);
  }

  // Email not in authorized list
  if (!AUTHORIZED_EMAILS.includes(user.email ?? '')) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen text-text bg-background admin-theme">
      {children}
    </div>
  );
}
