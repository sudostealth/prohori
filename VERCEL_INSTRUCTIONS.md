# Deployment Instructions for Vercel

This application requires specific environment variables to function correctly, especially for the Admin Subdomain (`hq.prohori.app`) and Authentication features.

## 1. Environment Variables

Go to your Vercel Project Dashboard -> **Settings** -> **Environment Variables**.

Add the following variables. **Make sure to uncheck "Development" if the value is only for Production, or use different values for Development and Production.**

| Variable Name | Value Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **CRITICAL:** The URL of your Supabase project. **MUST NOT be `localhost` in Production.** | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous key for your Supabase project. | `eyJhbG...` |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | The root domain for cookie sharing. | `.prohori.app` (note the leading dot) |
| `ADMIN_AUTHORIZED_EMAILS` | Comma-separated list of emails allowed to access the Admin Panel. | `admin@prohori.app, owner@prohori.app` |
| `ADMIN_URL_SEGMENT` | (Optional) The secret path segment for the admin dashboard. Defaults to `admin-secret-portal`. | `admin-secret-portal` |

### ⚠️ IMPORTANT: Common 502 Bad Gateway Error Fix

If you see a **502 Bad Gateway** with `DNS_HOSTNAME_NOT_FOUND` on `hq.prohori.app`:

1.  **Check `NEXT_PUBLIC_SUPABASE_URL`**: Ensure it is set to your **Supabase Cloud URL** (e.g., `https://your-project.supabase.co`), NOT `http://localhost:54321`.
2.  **Check Environment Scope**: In Vercel, ensure the variable is applied to **Production** and **Preview** environments, not just Development.
3.  **Redeploy**: After changing environment variables, you **must redeploy** your application for changes to take effect. Going to "Deployments" -> "Redeploy" is usually sufficient.

## 2. Subdomain Configuration

1.  In Vercel, go to **Settings** -> **Domains**.
2.  Add `hq.prohori.app`.
3.  Ensure it is assigned to the **same project** as `prohori.app`.
4.  Vercel will automatically handle SSL and routing.

## 3. Debugging

If you are still facing issues, navigate to `https://prohori.app/api/debug` (or `https://hq.prohori.app/api/debug`).
This endpoint will show you the current configuration status (sanitized) so you can verify if the environment variables are being read correctly.

- `NEXT_PUBLIC_SUPABASE_URL_SET`: Should be `true`.
- `NEXT_PUBLIC_SUPABASE_URL_IS_LOCALHOST`: Should be `false` in production.
