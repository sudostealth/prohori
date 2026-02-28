import { createRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // If no next param is provided, default to the confirmed page for a nice animation
  const next = requestUrl.searchParams.get('next') || '/auth/confirmed';

  if (code) {
    const supabase = createRouteClient();

    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error exchanging code:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not verify email. Please try logging in again.`);
      }

      if (session?.user?.email) {
        const authorizedEmails = (process.env.ADMIN_AUTHORIZED_EMAILS || '').split(',').map(e => e.trim());
        if (authorizedEmails.includes(session.user.email)) {
          return NextResponse.redirect('https://hq.prohori.app');
        }
      }
    } catch (err) {
      console.error('Unexpected auth callback error:', err);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Unexpected error during verification.`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
