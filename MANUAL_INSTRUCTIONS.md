# Manual Setup Instructions

This document outlines the manual steps required to fix the signup/login issues, enable email verification, and configure Resend as the SMTP provider for `joruri.prohori.app`.

## 1. Resend Configuration

1.  **Log in to Resend:** Go to [resend.com](https://resend.com) and log in.
2.  **Add Domain:**
    *   Navigate to "Domains" -> "Add Domain".
    *   Enter `joruri.prohori.app`.
    *   Select your region (usually "us-east-1").
    *   Click "Add".
3.  **Verify DNS Records:**
    *   Resend will provide you with DNS records (MX, TXT, CNAME).
    *   Log in to your DNS provider (where `prohori.app` is managed).
    *   Add these records specifically for the `joruri` subdomain.
    *   Wait for verification (status should turn "Verified").
4.  **Create API Key:**
    *   Go to "API Keys" -> "Create API Key".
    *   Name it "Supabase SMTP".
    *   Select "Full Access" or "Sending Access" (ensure it can send emails).
    *   **Copy the API Key immediately.** You will need this for the next step.

## 2. Supabase Auth Configuration (Email Settings)

To send emails using Resend Templates (and bypass Supabase's default template limitation), we will use a **Database Webhook + Edge Function**.

1.  **Disable Default Emails:**
    *   Go to **Authentication** -> **Email Templates**.
    *   Turn **OFF** the "Confirm email" template (toggle "Enable Email Confirmations" -> "Customize email" -> OFF? No, keep "Confirm email" enabled in *Providers*, but we need to stop Supabase from sending the default one).
    *   *Correction*: Supabase doesn't easily let you "stop" sending the default email while keeping the token generation active unless you use the "SMTP" method (which you tried and got 500 errors).
    *   **Alternative:** If you want to use the Edge Function method:
        *   You can leave the default email enabled for now as a fallback, OR
        *   Ideally, use the `supabase/functions/send-auth-email` edge function.

2.  **Deploy Edge Function:**
    *   Run `supabase functions deploy send-auth-email`.
    *   Set the Resend API Key: `supabase secrets set RESEND_API_KEY=re_12345...`
    *   Set Supabase URL/Key: `supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...`

3.  **Create Database Webhook (in Dashboard):**
    *   Go to **Database** -> **Webhooks**.
    *   Click **Create Webhook**.
    *   **Name:** `send-signup-email`
    *   **Table:** `auth.users`
    *   **Events:** `INSERT`
    *   **Type:** `HTTP Request`
    *   **URL:** Your deployed function URL (e.g., `https://<project-ref>.supabase.co/functions/v1/send-auth-email`)
    *   **Method:** `POST`
    *   **HTTP Headers:**
        *   `Content-Type`: `application/json`
        *   `Authorization`: `Bearer <Your Anon Key>` (ensure the function verifies this or is public)
    *   Click **Confirm**.

## 3. Supabase Auth Configuration (Redirects)

1.  **Enable Email Confirmations:**
    *   Go to **Authentication** -> **Providers** -> **Email**.
    *   Ensure "Confirm email" is **Enabled**.
    *   Ensure "Secure email change" is **Enabled**.
2.  **Configure Redirect URLs:**
    *   Go to **Authentication** -> **URL Configuration**.
    *   **Site URL:** Set this to your production URL: `https://prohori.app`.
    *   **Redirect URLs:** Add the following URLs **exactly**:
        *   `https://prohori.app/auth/callback`
        *   `https://www.prohori.app/auth/callback`
        *   `https://prohori.app/auth/confirmed`
        *   `https://www.prohori.app/auth/confirmed`
        *   `http://localhost:3000/auth/callback` (for local development)
    *   Click "Save".

## 4. Environment Variables (Vercel)

Ensure your Vercel project has the correct environment variables.

*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
*   `NEXT_PUBLIC_APP_URL`: `https://prohori.app` (Recommended for consistent redirects).

## 5. Troubleshooting 500 Errors

If you still see 500 errors:
1.  Check the **Edge Function Logs** in Supabase Dashboard -> Edge Functions -> `send-auth-email` -> Logs.
2.  Check if the **Resend API Key** is correct and has permission to send from `joruri.prohori.app`.
