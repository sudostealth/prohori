import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createRouteClient = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieDomain = isProd ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : undefined;

  return createRouteHandlerClient({
    cookies,
  }, {
    cookieOptions: cookieDomain ? {
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: true,
    } : undefined
  });
};
