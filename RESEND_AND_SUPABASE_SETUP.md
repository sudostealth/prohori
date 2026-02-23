# Email & Auth Setup Guide (Resend + Supabase)

This document outlines the steps to configure Supabase Authentication and Email services using Resend, ensuring seamless user signup, login, and admin access.

## 1. Environment Variables

Ensure your Vercel (or local `.env.local`) environment variables are set correctly:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Server-side only) | `eyJhbGci...` |
| `NEXT_PUBLIC_ADMIN_URL_SEGMENT` | Secret segment for admin portal (publicly visible but obscure) | `admin-secret-portal` |
| `ADMIN_AUTHORIZED_EMAILS` | Comma-separated list of admin emails | `admin@prohori.app, owner@prohori.app` |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | Domain for shared auth cookies (crucial for subdomains) | `.prohori.app` |
| `RESEND_API_KEY` | Your Resend API Key (for manual sending if needed) | `re_123...` |

> **Note:** `NEXT_PUBLIC_COOKIE_DOMAIN` must start with a dot (e.g., `.prohori.app`) to share sessions between `prohori.app` and `hq.prohori.app`.

## 2. Supabase SMTP Configuration (Resend)

To send all transactional emails (Signup confirmation, Reset Password, Invite) via Resend using your custom domain (`joruri.prohori.app`):

1.  **Get SMTP Credentials from Resend:**
    *   Log in to your [Resend Dashboard](https://resend.com/emails).
    *   Go to **Settings** -> **SMTP**.
    *   Generate a new API Key if needed.
    *   Note the Host (`smtp.resend.com`), Port (`465` or `587`), Username (`resend`), and Password (API Key).

2.  **Configure Supabase:**
    *   Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
    *   Navigate to **Project Settings** -> **Auth** -> **SMTP Settings**.
    *   Enable **Enable Custom SMTP**.
    *   Fill in the details:
        *   **Sender Email:** `noreply@joruri.prohori.app` (Must match your verified domain in Resend)
        *   **Sender Name:** `Prohori Security`
        *   **Host:** `smtp.resend.com`
        *   **Port:** `465` (SSL) or `587` (TLS)
        *   **Username:** `resend`
        *   **Password:** Your Resend API Key (`re_...`)
    *   Click **Save**.

3.  **Verify Domain in Resend:**
    *   Ensure `joruri.prohori.app` is verified in Resend (DNS records: DKIM, SPF, DMARC). You mentioned this is already done.

## 3. Supabase Auth URLs

To ensure redirects work correctly (especially for magic links and OAuth):

1.  Go to **Authentication** -> **URL Configuration**.
2.  **Site URL:** Set to `https://prohori.app`.
3.  **Redirect URLs:** Add the following:
    *   `https://prohori.app/auth/callback`
    *   `https://www.prohori.app/auth/callback`
    *   `https://hq.prohori.app/auth/callback` (Required for admin login flow if using OAuth/Magic Link directly on HQ, though we primarily redirect from main site)
    *   `http://localhost:3000/auth/callback` (For local development)

## 4. Admin Access Setup

The Admin Portal lives at `https://hq.prohori.app`. Access is restricted to authorized emails.

### How Admin Login Works:
1.  Admin visits `https://prohori.app/login` (Main Site).
2.  Enters email (e.g., `admin@prohori.app`) and password.
3.  System checks if email is in `ADMIN_AUTHORIZED_EMAILS`.
4.  If yes, redirects to `https://hq.prohori.app`.
5.  Middleware on `hq.prohori.app` detects the subdomain and verifies the session (shared via `.prohori.app` cookie).
6.  If valid, rewrites URL to `/${NEXT_PUBLIC_ADMIN_URL_SEGMENT}/...` internally to show the dashboard.

### Creating an Admin User:
Since there is no public "Admin Signup" page, you must create the user manually:

1.  **Create Auth User:**
    *   Go to Supabase Dashboard -> **Authentication** -> **Users**.
    *   Click **Add User** -> **Create New User**.
    *   Enter Email: `admin@prohori.app` (or whatever you use).
    *   Enter Password.
    *   Toggle "Auto confirm user?" to **ON**.
    *   Click **Create User**.

2.  **Authorize the Email:**
    *   Add the email to your `ADMIN_AUTHORIZED_EMAILS` environment variable in Vercel.
    *   Example: `admin@prohori.app, owner@prohori.app`
    *   Redeploy if needed.

3.  **Verify Admin Profile (Optional/Automatic):**
    *   The `public.handle_new_user()` trigger should automatically create a `profiles` entry.
    *   You can manually check the `profiles` table to ensure `role` is set to `owner` or `admin` (though access is primarily controlled by the email list env var currently).

## 5. Cleanup Notes

*   **Legacy Function Removed:** The custom Edge Function `send-auth-email` and its associated database trigger (`005_auth_hook.sql`) have been removed from the codebase. We now rely on standard Supabase SMTP for reliability.
*   **Variable Standardization:** The project now consistently uses `NEXT_PUBLIC_ADMIN_URL_SEGMENT` for the admin path.

## 6. Troubleshooting

*   **Login Loops:** Check `NEXT_PUBLIC_COOKIE_DOMAIN`. It MUST be set to `.prohori.app` (with leading dot) in Vercel.
*   **Email Not Sending:** Check Supabase Auth Logs (Project Settings -> Logs -> Auth) for SMTP errors (535 = Invalid Key, 550 = Sender Mismatch).
*   **Admin 404:** Ensure `NEXT_PUBLIC_ADMIN_URL_SEGMENT` matches in Vercel and your code deployment.
