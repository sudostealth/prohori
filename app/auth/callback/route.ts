import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // If no next param is provided, default to the confirmed page for a nice animation
  const next = requestUrl.searchParams.get('next') || '/auth/confirmed';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Auth callback error exchanging code:', error);
        // Redirect to login with error message
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not verify email. Please try logging in again.`);
      }
    } catch (err) {
      console.error('Unexpected auth callback error:', err);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Unexpected error during verification.`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
