import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  const isProd = process.env.NODE_ENV === 'production';
  let cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

  // Don't use the production cookie domain on localhost to prevent cookie rejection
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    cookieDomain = undefined;
  }

  return createClientComponentClient({
    cookieOptions: cookieDomain ? {
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    } : undefined
  });
};
