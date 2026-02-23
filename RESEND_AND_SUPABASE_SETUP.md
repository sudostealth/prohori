# Resend & Supabase Email Setup Guide

This guide details how to configure Supabase to send transactional emails (signup confirmation, password reset, etc.) using Resend via SMTP. This is critical to fix the "AuthApiError: Error sending confirmation email" (500) error.

## Prerequisite: Resend Configuration

1.  **Verify Domain**: Ensure `joruri.prohori.app` (or your chosen domain) is verified in the Resend Dashboard under **Domains**.
    -   Status must be **Verified**.
2.  **Generate API Key**: Create a new API Key in Resend with "Sending Access" (or Full Access).
    -   Copy this key immediately (starts with `re_...`).

## Supabase SMTP Configuration

Go to your Supabase Project Dashboard -> **Project Settings** -> **Auth** -> **SMTP Settings**.

**Enable Custom SMTP**: Toggle ON.

Fill in the following details EXACTLY:

*   **Sender Email**: `noreply@joruri.prohori.app`
    *   **CRITICAL**: This MUST match the domain verified in Resend. If you verified `joruri.prohori.app`, this email must be `@joruri.prohori.app`. Using `@prohori.app` will cause a 500 error if that domain is not verified separately.
*   **Sender Name**: `Prohori Security` (or your app name).
*   **Host**: `smtp.resend.com`
*   **Port**: `465`
*   **User**: `resend`
*   **Password**: `re_123456789...` (Paste your **Resend API Key** here. Do NOT put your Supabase key).
    *   *Note: The placeholder might say "YOUR_API_KEY", but you must paste the actual key starting with `re_`.*
*   **Minimum Interval**: `60` (default is fine).

**Click "Save"**.

## Testing the Configuration

1.  Go to the **Authentication** -> **Users** page in Supabase.
2.  Delete any test users that might be stuck.
3.  Go to your app's Signup page (`/signup`).
4.  Sign up with a real email address.
5.  Check your inbox. You should receive the confirmation email from `noreply@joruri.prohori.app`.

## Troubleshooting "500: Error sending confirmation email"

If you still see the error:
1.  **Double Check Sender Email**: Does it match the verified domain in Resend?
2.  **Check Resend Logs**: Go to Resend Dashboard -> **Logs**. Do you see a failed attempt? The log will say *why* it failed (e.g., "Sender identity not verified").
3.  **Check API Key**: Did you paste the correct Resend API Key in the SMTP Password field?

## Admin Subdomain Login Setup

To allow admins to log in on `www.prohori.app` and be redirected to `hq.prohori.app` while staying logged in, you must share cookies across subdomains.

1.  **Set Environment Variable**:
    In your Vercel Project Settings (and `.env.local` for local dev), add:
    ```
    NEXT_PUBLIC_COOKIE_DOMAIN=.prohori.app
    ```
    *(Note the leading dot)*.

2.  **Redeploy**: Redeploy your application for this change to take effect.
