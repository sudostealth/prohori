import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const vercelUrl = process.env.VERCEL_URL || '';
  const hostname = process.env.NEXT_PUBLIC_SITE_URL || '';

  return NextResponse.json({
    status: 'ok',
    env: {
      NEXT_PUBLIC_SUPABASE_URL_SET: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_URL_IS_LOCALHOST: supabaseUrl.includes('localhost'),
      NEXT_PUBLIC_SUPABASE_URL_PREFIX: supabaseUrl.substring(0, 8), // "https://" or "http://"
      NEXT_PUBLIC_COOKIE_DOMAIN: cookieDomain,
      NEXT_PUBLIC_APP_URL: appUrl,
      VERCEL_URL: vercelUrl,
      NEXT_PUBLIC_SITE_URL: hostname,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}
