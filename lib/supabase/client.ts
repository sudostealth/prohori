import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  // Try to determine the cookie domain dynamically or fall back to a reasonable default
  const isProd = process.env.NODE_ENV === 'production';
  // If in production, we want to share cookies across subdomains (e.g., .prohori.app)
  // For local development (localhost), we usually don't need to specify domain or just use localhost

  // NOTE: In a real deployment, you should probably set this via an env var like NEXT_PUBLIC_COOKIE_DOMAIN
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

  return createClientComponentClient({
    cookieOptions: cookieDomain ? {
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    } : undefined
  });
};
