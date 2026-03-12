# Vercel Configuration Instructions for Admin Subdomain

To enable the admin panel on the `hq.prohori.app` subdomain, you must configure it in your Vercel project settings.

## Step 1: Add the Domain in Vercel
1. Go to your project on the Vercel Dashboard.
2. Navigate to **Settings** > **Domains**.
3. In the input field, type `hq.prohori.app` and click **Add**.
4. Vercel will attempt to verify the domain. If `prohori.app` is already managed by Vercel or you're using Vercel Nameservers, this might be automatically configured.

## Step 2: Configure DNS Records
If your domain is managed externally (e.g., Cloudflare, GoDaddy, Namecheap), Vercel will provide you with the required DNS records (typically a CNAME record).
- **Type**: `CNAME`
- **Name/Host**: `hq`
- **Value/Target**: `cname.vercel-dns.com`

*Wait for the DNS propagation to finish. Once Vercel shows a green checkmark next to the domain, it is fully active.*

## Step 3: Set Environment Variables
The application needs to know which domain should route to the admin panel.
1. In your Vercel Dashboard, go to **Settings** > **Environment Variables**.
2. Add or ensure the following environment variables are set:
   - `NEXT_PUBLIC_ADMIN_DOMAIN` = `hq.prohori.app`
   - `NEXT_PUBLIC_ADMIN_SEGMENT` = `hq`
   - `NEXT_PUBLIC_ADMIN_EMAIL` = `admin@prohori.app` (make sure it's the exact email of your admin account in Supabase)
3. Redeploy the project so that these environment variable changes take effect.

## Step 4: Verify Subdomain Redirection
Once deployed, open `https://hq.prohori.app` in your browser.
1. The middleware will intercept the request.
2. It should serve the admin login page (which normally resides at `/hq/login`).
3. After logging in with the admin credentials, it will route you to the root of the subdomain `https://hq.prohori.app/`.

### Supabase Redirects
Don't forget to configure Supabase Auth to allow redirects back to the new subdomain if not already done.
1. In the Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2. Add `https://hq.prohori.app/auth/callback` to the **Redirect URLs**.