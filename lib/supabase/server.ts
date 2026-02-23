import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

  return createServerComponentClient({ cookies }, {
    cookieOptions: cookieDomain ? {
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    } : undefined
  });
};
