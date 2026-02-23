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

## 2. Supabase SMTP Configuration

To ensure emails are sent reliably and from your custom domain, configure Supabase to use Resend's SMTP service.

1.  **Log in to Supabase:** Go to your project dashboard.
2.  **Navigate to Auth Settings:** Go to **Authentication** -> **Providers** -> **Email**.
3.  **Enable Email Provider:** Ensure "Email" is enabled.
4.  **Configure SMTP:**
    *   Scroll down to "SMTP Settings".
    *   Toggle "Enable Custom SMTP" to **ON**.
    *   **Sender Email:** `noreply@joruri.prohori.app` (or `auth@joruri.prohori.app` - must match the verified domain in Resend).
    *   **Sender Name:** `Prohori Security` (or your preferred name).
    *   **Host:** `smtp.resend.com`
    *   **Port:** `465`
    *   **User:** `resend`
    *   **Password:** Paste the **Resend API Key** you created in Step 1.
    *   Click "Save".

## 3. Supabase Auth Configuration

1.  **Enable Email Confirmations:**
    *   Go to **Authentication** -> **Providers** -> **Email**.
    *   Ensure "Confirm email" is **Enabled**.
    *   Ensure "Secure email change" is **Enabled**.
2.  **Configure Redirect URLs:**
    *   Go to **Authentication** -> **URL Configuration**.
    *   **Site URL:** Set this to your production URL: `https://prohori.app`.
    *   **Redirect URLs:** Add the following URLs:
        *   `https://prohori.app/auth/callback`
        *   `http://localhost:3000/auth/callback` (for local development)
    *   Click "Save".

## 4. Update Email Templates

Since Supabase is handling the email content (sending via Resend SMTP), you need to ensure the templates are correct.

1.  **Go to Email Templates:**
    *   Go to **Authentication** -> **Email Templates**.
2.  **Confirm Signup:**
    *   **Subject:** `Confirm your Prohori account`
    *   **Body:** Ensure the link uses `{{ .ConfirmationURL }}`.
    *   Example Body:
        ```html
        <h2>Welcome to Prohori!</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
        ```
3.  **Reset Password:**
    *   **Subject:** `Reset your Prohori password`
    *   **Body:** Ensure the link uses `{{ .ConfirmationURL }}` (or `{{ .SiteURL }}/update-password?access_token={{ .Token }}` depending on your flow, but usually `.ConfirmationURL` handles the redirect to the callback).
    *   Example Body:
        ```html
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
        ```

## 5. Environment Variables (Vercel)

Ensure your Vercel project has the correct environment variables.

*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
*   `NEXT_PUBLIC_APP_URL`: `https://prohori.app` (Recommended for consistent redirects).

Once these steps are completed, the signup and login flows should work correctly with email verification.
