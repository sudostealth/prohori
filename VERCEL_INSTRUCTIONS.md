# Vercel Deployment Instructions

To fix the `502: BAD_GATEWAY` and `DNS_HOSTNAME_NOT_FOUND` error, you must update your Environment Variables on Vercel.

## The Problem
The error happens because `NEXT_PUBLIC_SUPABASE_URL` is set to `http://localhost:3000` (or similar) in your Vercel project settings.
When your application runs on Vercel's servers (Edge Network), it cannot access "localhost" because "localhost" refers to the server itself, not your computer or your database.

## The Fix

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your project (**prohori**).
3. Go to **Settings** > **Environment Variables**.
4. Find `NEXT_PUBLIC_SUPABASE_URL`.
5. Edit it and change the value to your **Real Supabase Project URL**.
   - Example: `https://your-project-ref.supabase.co`
   - You can find this in your Supabase Dashboard under Settings > API.
6. Find `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Ensure it is set to your real **Project API Key (anon/public)**.
7. **Redeploy** your latest commit for the changes to take effect.
   - You can do this by going to the **Deployments** tab, clicking the three dots on the latest deployment, and selecting **Redeploy**.

## Other Variables
Ensure these are also correct for production:
- `NEXT_PUBLIC_COOKIE_DOMAIN`: Set to `.prohori.app` (note the leading dot) to allow login sessions to work across `prohori.app` and `hq.prohori.app`.
- `ADMIN_AUTHORIZED_EMAILS`: Comma-separated list of admin emails.
