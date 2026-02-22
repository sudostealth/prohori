# PROHORI — Full-Stack AI Agent Build Prompt
## Structured Engineering Specification for a Senior AI Coding Agent

---

## 0. AGENT BEHAVIOR RULES

Before writing a single line of code, read this entire prompt. Do not skip sections.
- Ask zero clarifying questions. All decisions are specified here.
- If a technology choice is ambiguous, default to the most modern, type-safe option.
- Validate every environment variable reference exists in `.env.example`.
- After completing each major section, output a checklist confirming what was built.
- Never truncate code. Output complete, production-ready files.

---

## 1. PROJECT IDENTITY

**Product Name:** Prohori (প্রহরী)
**Tagline:** Digital Resilience Suite for Smart Bangladesh
**Type:** Multi-tenant SaaS — Security-as-a-Service (SECaaS)
**Target Users:** Bangladeshi SME business owners (non-technical)
**Primary Language:** English UI with Bangla AI output support

---

## 2. TECH STACK (NON-NEGOTIABLE)

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS v3 + shadcn/ui components |
| Animations | Framer Motion |
| Backend / Auth | Supabase (PostgreSQL + Auth + Edge Functions + RLS) |
| Security Core | Wazuh REST API (external, via secure middleware) |
| AI - Real-time | Groq API (Llama 3.3 70B) |
| AI - Batch/Reports | Google Gemini 2.5 Flash API |
| PDF Generation | LaTeX via `node-latex` npm package |
| Email | Resend API |
| Payments | bKash Tokenized Checkout API v1.2.0 + Nagad API |
| Notifications | Twilio (WhatsApp) + Resend (email) |
| Hosting | Vercel (frontend) + Oracle Cloud Infrastructure ARM (Wazuh core) |
| State Management | Zustand |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## 3. REPOSITORY STRUCTURE

```
prohori/
├── .env.example                          # ALL environment variables documented
├── .env.local                            # Gitignored secrets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Marketing landing page
│   ├── globals.css                       # Design tokens, CSS variables
│   │
│   ├── (auth)/                           # Auth group — no sidebar
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                      # User portal — authenticated
│   │   ├── layout.tsx                    # Sidebar + top nav shell
│   │   ├── dashboard/page.tsx            # Unified Security Dashboard
│   │   ├── ai-analyst/page.tsx           # AI Security Analyst
│   │   ├── compliance/page.tsx           # Compliance Engine (CSA 2023)
│   │   ├── bug-bounty/
│   │   │   ├── page.tsx                  # Bug bounty marketplace
│   │   │   └── [id]/page.tsx             # Bug submission detail
│   │   ├── hrm/page.tsx                  # HRM & Access Control
│   │   ├── billing/page.tsx              # Subscription & payment
│   │   ├── notifications/page.tsx        # Notification center
│   │   └── settings/page.tsx             # Organization settings
│   │
│   └── [ADMIN_URL_SEGMENT]/              # Admin portal — secret URL from .env
│       ├── layout.tsx                    # Admin layout (authorized email gate)
│       ├── page.tsx                      # Admin dashboard
│       ├── users/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── companies/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── subscriptions/page.tsx
│       ├── alerts/page.tsx
│       ├── revenue/page.tsx
│       ├── announcements/page.tsx
│       ├── email-center/page.tsx
│       ├── promo-codes/page.tsx
│       ├── content-manager/page.tsx
│       └── settings/page.tsx
│
├── components/
│   ├── ui/                               # shadcn/ui primitives
│   ├── layout/
│   │   ├── UserSidebar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── SecurityStatusCard.tsx
│   │   ├── ThreatFeedTable.tsx
│   │   ├── ServerHealthChart.tsx
│   │   ├── AttackMapWidget.tsx
│   │   └── LiveAlertTicker.tsx
│   ├── ai-analyst/
│   │   ├── ChatBubble.tsx
│   │   ├── AskAIButton.tsx
│   │   └── AlertExplainer.tsx
│   ├── compliance/
│   │   ├── ReportGenerator.tsx
│   │   └── ComplianceSummaryCard.tsx
│   ├── bug-bounty/
│   │   ├── BountyCard.tsx
│   │   ├── SubmissionForm.tsx
│   │   └── RewardActions.tsx
│   ├── hrm/
│   │   ├── EmployeeTable.tsx
│   │   ├── RoleManager.tsx
│   │   └── AccessLog.tsx
│   ├── billing/
│   │   ├── PlanCard.tsx
│   │   ├── BkashCheckout.tsx
│   │   └── InvoiceTable.tsx
│   └── admin/
│       ├── StatsGrid.tsx
│       ├── UserDetailSlideout.tsx
│       ├── CompanyDetailPanel.tsx
│       ├── AlertInvestigation.tsx
│       ├── AnnouncementEditor.tsx
│       ├── EmailComposer.tsx
│       └── PromoCodeManager.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   ├── server.ts                     # Server Supabase client
│   │   └── middleware.ts                 # Auth middleware
│   ├── wazuh/
│   │   └── api.ts                        # Wazuh API wrapper
│   ├── ai/
│   │   ├── groq.ts                       # Groq API client + prompts
│   │   └── gemini.ts                     # Gemini API client + prompts
│   ├── payments/
│   │   ├── bkash.ts                      # bKash API wrapper
│   │   └── nagad.ts                      # Nagad API wrapper
│   ├── email/
│   │   └── resend.ts                     # Resend email templates
│   ├── notifications/
│   │   └── whatsapp.ts                   # Twilio WhatsApp wrapper
│   ├── pdf/
│   │   └── generateCompliancePDF.ts      # LaTeX → PDF pipeline
│   ├── admin/
│   │   └── guard.ts                      # Admin email authorization check
│   ├── utils.ts
│   └── constants.ts
│
├── hooks/
│   ├── useWazuhAlerts.ts
│   ├── useAIAnalyst.ts
│   ├── useComplianceReport.ts
│   ├── useSubscription.ts
│   └── useAdminGuard.ts
│
├── store/
│   └── useStore.ts                       # Zustand global state
│
├── types/
│   ├── database.types.ts                 # Supabase generated types
│   ├── wazuh.types.ts
│   └── api.types.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql                  # Full schema
│   └── functions/
│       ├── process-alert/index.ts        # Edge function: alert → notify
│       ├── explain-alert/index.ts        # Edge function: log → Groq
│       ├── generate-report/index.ts      # Edge function: Gemini batch
│       └── bkash-callback/index.ts       # Edge function: payment webhook
│
└── scripts/
    ├── wazuh-poller.py                   # Python: poll Wazuh → webhook
    └── monthly-report-job.py             # Python: cron → Gemini → LaTeX → PDF
```

---

## 4. ENVIRONMENT VARIABLES (.env.example)

```bash
# ── Supabase ──────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Admin Portal ──────────────────────────────────────────────────
# This is the secret URL segment for the admin panel e.g. /prohori-hq-9f3a
ADMIN_URL_SEGMENT=
# Comma-separated list of authorized admin emails
ADMIN_AUTHORIZED_EMAILS=

# ── Wazuh ─────────────────────────────────────────────────────────
WAZUH_API_BASE_URL=
WAZUH_API_USER=
WAZUH_API_PASSWORD=

# ── AI APIs ───────────────────────────────────────────────────────
GROQ_API_KEY=
GEMINI_API_KEY=

# ── Payments ──────────────────────────────────────────────────────
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
NAGAD_MERCHANT_ID=
NAGAD_MERCHANT_KEY=
NAGAD_BASE_URL=

# ── Email ─────────────────────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=noreply@prohori.com

# ── Notifications ─────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# ── Storage ───────────────────────────────────────────────────────
SUPABASE_STORAGE_BUCKET=compliance-reports

# ── App ───────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. DATABASE SCHEMA (Supabase PostgreSQL)

Create the following tables in `supabase/migrations/001_init.sql`. Apply Row Level Security on every table.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUM TYPES ────────────────────────────────────────────────────────────────

CREATE TYPE subscription_plan AS ENUM ('basic', 'pro', 'enterprise', 'free');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'overdue', 'trial');
CREATE TYPE payment_method AS ENUM ('bkash', 'nagad', 'rocket', 'manual');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'user', 'viewer', 'researcher');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE alert_status AS ENUM ('open', 'investigating', 'blocked', 'resolved', 'false_positive');
CREATE TYPE bounty_status AS ENUM ('open', 'under_review', 'accepted', 'rejected', 'paid', 'fixed');
CREATE TYPE bounty_severity AS ENUM ('critical', 'high', 'medium', 'low', 'informational');
CREATE TYPE agent_status AS ENUM ('connected', 'disconnected', 'pending');
CREATE TYPE announcement_target AS ENUM ('all', 'basic', 'pro', 'enterprise');
CREATE TYPE email_template AS ENUM ('welcome', 'alert', 'invoice', 'custom', 'compliance');

-- ── COMPANIES ─────────────────────────────────────────────────────────────────

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_id TEXT UNIQUE,             -- BIN number
  website TEXT,
  address TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  subscription_plan subscription_plan DEFAULT 'basic',
  subscription_status subscription_status DEFAULT 'trial',
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROFILES (extends auth.users) ────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_whatsapp BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  plan subscription_plan NOT NULL,
  status subscription_status DEFAULT 'active',
  price_bdt DECIMAL(10,2) NOT NULL,
  payment_method payment_method,
  billing_cycle TEXT DEFAULT 'monthly',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT TRUE,
  promo_code TEXT,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ─────────────────────────────────────────────────────────────────

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,   -- INV-YYYY-MM-NNNN
  company_id UUID NOT NULL REFERENCES companies(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount_bdt DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method payment_method,
  payment_ref TEXT,                      -- bKash/Nagad transaction ID
  pdf_url TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROMO CODES ───────────────────────────────────────────────────────────────

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  applicable_plans subscription_plan[],
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_by TEXT,                       -- admin email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── WAZUH AGENTS ─────────────────────────────────────────────────────────────

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  wazuh_agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ip_address TEXT,
  os TEXT,
  status agent_status DEFAULT 'pending',
  last_seen TIMESTAMPTZ,
  version TEXT,
  install_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SECURITY ALERTS ───────────────────────────────────────────────────────────

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  agent_id UUID REFERENCES agents(id),
  wazuh_alert_id TEXT,
  wazuh_rule_id TEXT,
  severity alert_severity NOT NULL,
  status alert_status DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  raw_log JSONB,
  source_ip TEXT,
  destination_ip TEXT,
  affected_file TEXT,
  ai_explanation TEXT,                   -- Groq output
  ai_recommendations TEXT[],            -- Groq action items
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  notified_whatsapp BOOLEAN DEFAULT FALSE,
  notified_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COMPLIANCE REPORTS ────────────────────────────────────────────────────────

CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  report_month DATE NOT NULL,            -- First day of the report month
  threats_blocked INTEGER DEFAULT 0,
  threats_critical INTEGER DEFAULT 0,
  uptime_percent DECIMAL(5,2),
  top_attack_types JSONB,
  ai_summary TEXT,                       -- Gemini output
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  law_version TEXT DEFAULT 'CSA 2023',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BUG BOUNTY PROGRAMS ───────────────────────────────────────────────────────

CREATE TABLE bounty_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  scope_urls TEXT[],
  out_of_scope TEXT[],
  reward_critical INTEGER,               -- in BDT
  reward_high INTEGER,
  reward_medium INTEGER,
  reward_low INTEGER,
  reward_informational INTEGER,
  total_budget INTEGER,
  spent_budget INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bounty_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES bounty_programs(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  researcher_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity bounty_severity NOT NULL,
  steps_to_reproduce TEXT,
  proof_of_concept TEXT,
  affected_url TEXT,
  cve_id TEXT,
  status bounty_status DEFAULT 'open',
  reward_amount INTEGER,
  payment_ref TEXT,
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HRM & ACCESS CONTROL ─────────────────────────────────────────────────────

CREATE TABLE hrm_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  profile_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  position TEXT,
  access_level TEXT DEFAULT 'standard',
  allowed_data_scopes TEXT[],
  mfa_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  profile_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target announcement_target DEFAULT 'all',
  is_published BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,             -- admin email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ADMIN EMAIL LOGS ─────────────────────────────────────────────────────────

CREATE TABLE admin_email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_type email_template,
  subject TEXT NOT NULL,
  recipients TEXT[],
  company_filter TEXT,
  plan_filter subscription_plan,
  body_html TEXT,
  resend_email_id TEXT,
  sent_by TEXT NOT NULL,               -- admin email
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0
);

-- ── PLATFORM CONTENT (editable by admin) ─────────────────────────────────────

CREATE TABLE platform_content (
  key TEXT PRIMARY KEY,               -- e.g., 'homepage_hero', 'pricing_basic_features'
  value JSONB NOT NULL,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing content
INSERT INTO platform_content (key, value, description) VALUES
  ('pricing_plans', '{"basic":{"price":999,"features":["1 Agent","Email Alerts","Basic SIEM","Compliance Reports"]},"pro":{"price":2499,"features":["5 Agents","WhatsApp Alerts","AI Analyst","Bug Bounty","Priority Support"]},"enterprise":{"price":9999,"features":["Unlimited Agents","All Features","Custom SLA","Dedicated Support","White-label Reports"]}}', 'Subscription plans and pricing'),
  ('homepage_hero', '{"headline":"Digital Security for Every Bangladeshi Business","subheadline":"AI-powered threat detection, CSA 2023 compliance, and real-time monitoring — all in Bangla."}', 'Homepage hero section'),
  ('notification_templates', '{"brute_force":"⚠️ Security Alert: Brute force attack detected on your server. {count} attempts from {ip} blocked.","malware":"🚨 Critical: Malware activity detected. Immediate action required.","compliance_ready":"✅ Your monthly compliance report is ready. Download from your dashboard."}', 'Notification message templates');

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrm_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company's data
CREATE POLICY "company_isolation" ON companies
  FOR ALL USING (id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "profile_own" ON profiles
  FOR ALL USING (id = auth.uid() OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_alerts" ON alerts
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_agents" ON agents
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_compliance_reports" ON compliance_reports
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_bounty_programs" ON bounty_programs
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Researchers see only their own submissions; companies see submissions to their programs
CREATE POLICY "bounty_submissions_access" ON bounty_submissions
  FOR ALL USING (
    researcher_id = auth.uid() OR
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Announcements: all authenticated users can read published ones
CREATE POLICY "announcements_read" ON announcements
  FOR SELECT USING (is_published = TRUE);

-- ── INDEXES ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_alerts_company_created ON alerts(company_id, created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity, status);
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_invoices_company ON invoices(company_id, created_at DESC);
CREATE INDEX idx_bounty_submissions_program ON bounty_submissions(program_id, status);
CREATE INDEX idx_access_logs_company ON access_logs(company_id, created_at DESC);
CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
```

---

## 6. ADMIN PORTAL — SECURITY & ACCESS CONTROL

### 6.1 Secret URL Implementation

The admin portal lives at `app/[ADMIN_URL_SEGMENT]/`. This segment is loaded at build-time from the environment variable `ADMIN_URL_SEGMENT`.

**Implementation in `next.config.ts`:**
```typescript
// The admin segment is embedded in the build.
// The URL is NOT exposed to the client bundle.
// Only server-side code reads ADMIN_URL_SEGMENT.
```

**Implementation in `app/[ADMIN_URL_SEGMENT]/layout.tsx`:**
```typescript
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ADMIN_SEGMENT = process.env.ADMIN_URL_SEGMENT!;
const AUTHORIZED_EMAILS = process.env.ADMIN_AUTHORIZED_EMAILS!.split(',').map(e => e.trim());

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { slug: string[] };
}) {
  // Verify URL segment matches
  if (params.slug[0] !== ADMIN_SEGMENT) {
    redirect('/404');
  }

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in
  if (!user) {
    redirect(`/${ADMIN_SEGMENT}/login`);
  }

  // Email not in authorized list
  if (!AUTHORIZED_EMAILS.includes(user.email ?? '')) {
    redirect('/unauthorized');
  }

  return <AdminShell>{children}</AdminShell>;
}
```

**Admin login page:** A completely separate auth flow. Only accepts emails in `ADMIN_AUTHORIZED_EMAILS`. Any other email shows "Access Denied" without revealing the portal exists.

---

## 7. USER PORTAL — FEATURE SPECIFICATIONS

### 7.1 Unified Security Dashboard (`/dashboard`)

**Layout:** Full-width with a 3-column bento grid.

**Components to render:**
1. **Health Status Hero Card** — Full-width top banner. Giant colored status indicator (🟢 Secure / 🟡 Warning / 🔴 Critical). Shows `{threats_blocked_today}` threats blocked, `{agents_connected}` agents online.
2. **Live Threat Feed Table** — Real-time polling every 15 seconds via `useWazuhAlerts` hook. Columns: Severity badge, Alert type, Source IP (geolocated country flag), Time (relative), Status, Action button. Rows are color-coded by severity. New alerts animate in with a slide-in effect.
3. **Server Health Charts** — CPU, RAM, Disk usage via Recharts `AreaChart`. Data fetched from Wazuh agent stats endpoint.
4. **Attack Statistics** — `BarChart` showing attack types this month. `PieChart` for geographic origin of attacks.
5. **Quick Actions Bar** — Buttons: "Ask AI", "Generate Report", "View Agents", "Invite Employee".
6. **Agent Status List** — Cards for each installed Wazuh agent. Shows: Agent name, OS, IP, status dot (connected/disconnected), last seen time.
7. **Announcements Banner** — Fetches published announcements from `announcements` table. Dismissible. Pinned announcements always show.

**Data fetching:**
- All Wazuh data proxied through `/api/wazuh/[...path]/route.ts` which adds authentication headers server-side.
- Cache: `revalidate: 15` seconds for alert lists, `revalidate: 60` for stats.

---

### 7.2 AI Security Analyst (`/ai-analyst`)

**Layout:** Split-pane. Left: Alert list. Right: Chat interface.

**Behavior:**
1. User selects an alert from the left pane.
2. Alert details load in the right pane with raw log visible (collapsible).
3. User clicks "Ask AI" — triggers POST to `/api/explain-alert`.
4. API route: verifies session → fetches raw log from Wazuh → calls Groq via streaming → returns Server-Sent Events (SSE) to the client.
5. Response streams into a chat bubble with a typing animation.
6. AI response always includes: Explanation (plain language), Severity assessment, Top 3 recommended actions (numbered list), optional "Generate step-by-step fix guide" button.

**System prompt for Groq (in `lib/ai/groq.ts`):**
```
You are Prohori AI, a friendly cybersecurity assistant for Bangladeshi small business owners who are NOT technical experts. 

When explaining a security log:
1. Start with a one-sentence plain-language summary of what happened
2. Explain WHY this is a threat (or not)
3. Rate urgency: Critical / High / Medium / Low
4. Give exactly 3 specific action steps the business owner can take, numbered clearly
5. If the threat was already blocked, say so reassuringly first
6. Use simple analogies when helpful (e.g., "This is like someone trying many keys on your front door lock")
7. Offer to explain in Bangla if needed

Keep responses under 300 words. Be warm, not alarming.

Context: The user runs a small business in Bangladesh. They use this dashboard to protect their livelihood.
```

**Chat history:** Stored in Zustand (session only). Each alert has its own conversation thread stored in a local map `{ alertId: Message[] }`.

---

### 7.3 Localized Compliance Engine (`/compliance`)

**Layout:** Two-column. Left: compliance overview cards. Right: report generation panel.

**Compliance Overview Cards:**
- CSA 2023 Compliance Score (gauge chart, 0-100)
- Bangladesh Bank Regulation Status
- Last audit date
- Next scheduled audit
- Issues requiring attention (count badge)

**Report Generation Flow:**
1. User selects month/year from a dropdown.
2. Clicks "Generate CSA 2023 Audit Report".
3. Frontend calls `/api/generate-compliance-report` (POST).
4. API route:
   a. Fetches all alerts for that month from Supabase for the company.
   b. Compiles statistics: threats blocked, threats by severity, uptime%, top attack types.
   c. Sends summary data to Gemini 2.5 Flash with prompt: "Generate a formal compliance executive summary for the Cyber Security Act 2023, Bangladesh. Data: [stats]. Output structured JSON with fields: executive_summary, key_findings[], recommendations[], compliance_statement."
   d. Takes Gemini JSON output → injects into LaTeX template via `node-latex`.
   e. Generates PDF → uploads to Supabase Storage.
   f. Saves record to `compliance_reports` table.
   g. Returns signed URL.
5. Frontend shows a download button and PDF preview.

**LaTeX Template:** (`scripts/compliance_template.tex`)
Professional A4 layout with:
- Prohori letterhead
- Company name, BIN, report period
- Executive summary (from Gemini)
- Data tables: threats by type, severity breakdown, agent uptime
- Compliance statement paragraph
- Digital certificate section with report ID
- All text supports Unicode (xelatex + Bangla font support)

---

### 7.4 SME Bug Bounty Marketplace (`/bug-bounty`)

**Layout:** Tabs: "My Programs" | "Discover Programs" (for researchers) | "Submissions" | "Leaderboard"

**For Company Owners:**
- Create Program form: program title, description, scope URLs (comma-separated), out-of-scope URLs, reward tiers per severity (BDT input for each), total budget.
- View submissions to their programs. Each submission shows: title, severity badge, researcher name (pseudonymous until accepted), status, date.
- Actions on submission: Accept & Pay | Reject | Request More Info | Mark Fixed.
- "Accept & Pay" triggers bKash payment to researcher's bKash number stored in their profile.

**For Researchers (role: 'researcher'):**
- Browse active programs with reward tiers visible.
- Submit vulnerability report form: Program select, title, severity, affected URL, description, steps to reproduce (markdown editor), proof of concept (code block), optional CVE ID.
- View their own submission history with status tracking.

**Leaderboard:** Top researchers by accepted submissions count and total rewards earned (by display name or pseudonym).

**RLS enforcement:** Supabase RLS ensures companies only see submissions to their programs. Researchers only see their own submissions until accepted.

---

### 7.5 HRM & Access Control (`/hrm`)

**Layout:** Three tabs: "Team Members" | "Access Logs" | "Role Management"

**Team Members Tab:**
- Table of all employees in the company (from `hrm_employees`).
- Columns: Name, Email, Department, Role, MFA status, Access Level, Active status, Actions.
- Invite new employee: sends Resend email with signup link pre-linked to the company.
- Edit employee: change role, department, access level, data scopes.
- Deactivate/Reactivate employee instantly.

**Access Logs Tab:**
- Chronological log of all user actions within the company account.
- Filterable by: user, action type, date range, success/failure.
- Shows: Who did What, When, from which IP, on which resource.
- Suspicious activity auto-flagged (multiple failed logins, unusual hours).

**Role Management Tab:**
- Visual role hierarchy diagram.
- Role definitions: Owner > Admin > User > Viewer > Researcher.
- Permission matrix table: What each role can see/do.
- Ability to create custom permission presets.

---

### 7.6 Billing & Subscription (`/billing`)

**Layout:** Current plan card + payment history table + upgrade options.

**Current Plan Card:** Shows plan name, price, billing date, agent limit, features included, payment method (bKash/Nagad number).

**Upgrade Flow:**
1. User clicks upgrade plan card.
2. Promo code input field (validated against `promo_codes` table, shows discount instantly).
3. Selects bKash or Nagad.
4. Clicks "Pay ৳{amount}" → POST to `/api/payments/bkash/create`.
5. API creates bKash payment session → returns `bkashURL`.
6. User redirected to bKash payment page.
7. On success, bKash redirects to `/api/payments/bkash/callback` → updates subscription in Supabase → redirects to `/billing?success=true`.

**Invoice Table:** All past invoices with download PDF button (invoices auto-generated by Resend).

---

## 8. ADMIN PORTAL — FEATURE SPECIFICATIONS

**Admin base path:** `/{ADMIN_URL_SEGMENT}/`
**Access:** Only emails in `ADMIN_AUTHORIZED_EMAILS` can log in.
**Design:** Dark theme. More data-dense than user portal. Professional command-center aesthetic.

---

### 8.1 Admin Dashboard (`/{ADMIN_URL_SEGMENT}/`)

**KPI Cards (top row):**
- Total Organizations (with delta vs last week)
- Monthly Recurring Revenue in ৳ (with % change)
- Active Subscriptions count
- Critical Alerts (system-wide, last 24h)
- Average Response Time to alerts
- Payment Success Rate %

**Charts:**
- Revenue line chart (last 6 months) — Recharts `LineChart`
- Subscription plan distribution — `PieChart`
- New signups per day — `BarChart`
- Alert severity distribution — `RadarChart`

**Recent Activity Feed:** Live-updating list of: new signups, payments received, critical alerts, subscription cancellations.

**System Health:** Wazuh server status, Supabase status, AI API status (green/red indicators).

---

### 8.2 User Management (`/{ADMIN_URL_SEGMENT}/users`)

- Paginated table (50/page) with search and filter (by role, company, status, plan).
- Bulk actions: Suspend, Activate, Send email, Export.
- Click row → slide-out panel with full user details:
  - Profile info, company info, subscription, activity log, login history.
  - Actions: Suspend, Reset password (triggers Supabase password reset email), Delete, Impersonate (logs admin action), Send email.

---

### 8.3 Company Management (`/{ADMIN_URL_SEGMENT}/companies`)

- Filterable directory with industry, plan, status, agent count columns.
- Company detail view: full profile, subscription history, security stats, team members, agent health.
- Admin can: Edit company info, Suspend company (blocks all users), Force downgrade plan, Delete with data export, Contact company via email.

---

### 8.4 Subscription Management (`/{ADMIN_URL_SEGMENT}/subscriptions`)

- Summary metrics: MRR, churn rate, ARPU, new this month.
- List of all subscriptions with status (active/overdue/cancelled).
- Filter by plan, payment status, overdue period.
- Actions per subscription: Change plan, Cancel, Issue refund (marks in DB, manual bKash refund), Pause, Extend by N days, Add free months.
- **Grant free subscription:** Form to give a company any plan free for a specified duration. Logged in audit trail.

---

### 8.5 Security Alerts (System-wide) (`/{ADMIN_URL_SEGMENT}/alerts`)

- Global view of all alerts across all companies (admin-only Supabase query using service role).
- Filters: severity, company, status, date range, attack type.
- Click alert → investigation panel showing: raw log, affected company info, AI analysis, affected systems, action history.
- Admin actions: Escalate to company (send WhatsApp + email), Mark as false positive, Generate incident report PDF, Isolate company server (webhook to Wazuh).

---

### 8.6 Revenue & Analytics (`/{ADMIN_URL_SEGMENT}/revenue`)

- MRR chart, YTD revenue, revenue by plan, revenue by payment method (bKash/Nagad/Rocket).
- Outstanding payments with overdue aging (30/60/90 days).
- Per-company revenue history.
- Export to Excel/CSV.
- "Send payment reminder" button → triggers Resend email to company owner.

---

### 8.7 Announcements (`/{ADMIN_URL_SEGMENT}/announcements`)

- Rich text editor (use `@uiw/react-md-editor` or `tiptap`) for announcement content.
- Fields: Title, Content (rich text), Target (all/basic/pro/enterprise), Pin announcement, Schedule publish date, Expiry date.
- Preview button: shows how announcement will look to users.
- Publish/Unpublish toggle. Published announcements immediately appear on user dashboards.
- Announcement history table with edit/delete.

---

### 8.8 Email Center (`/{ADMIN_URL_SEGMENT}/email-center`)

**Send Professional Emails via Resend:**

Email composer form:
- **To:** Multi-select: All users | By plan | By company | Custom email list
- **Template:** Pre-built templates (Welcome, Security Alert, Invoice reminder, Compliance reminder, Custom)
- **Subject:** Text input
- **Body:** Rich HTML editor with Prohori branded template wrapper auto-applied
- **Schedule:** Send now or schedule for later
- Preview pane (live preview of rendered email)
- "Send Test Email" to admin's own email before broadcast

**Email templates available:**
- `welcome` — Onboarding email for new companies
- `security_alert` — Critical security notification  
- `invoice_reminder` — Payment due reminder
- `compliance_reminder` — Monthly report generation reminder
- `feature_announcement` — New feature/update
- `custom` — Full HTML compose

**Email logs:** All sent emails logged in `admin_email_logs` with success/error counts.

---

### 8.9 Promo Code Manager (`/{ADMIN_URL_SEGMENT}/promo-codes`)

- List of all promo codes with: code, discount%, uses, validity, status.
- Create new promo code: code text (auto-generate button), discount %, max uses (or unlimited), valid from/until, applicable plans.
- Edit / Deactivate / Delete.
- Usage analytics: which companies used which codes.

---

### 8.10 Content Manager (`/{ADMIN_URL_SEGMENT}/content-manager`)

Admin can edit platform content stored in `platform_content` table:
- **Pricing Plans:** Edit plan names, prices, features list for each tier. Changes reflect immediately on the pricing page and billing page.
- **Notification Templates:** Edit WhatsApp/email message templates for different alert types.
- **Homepage Content:** Edit hero headline, subheadline, feature descriptions.
- **Compliance Report Template:** Upload/edit the LaTeX template used for PDF generation.

Each content item has a JSON editor with a visual preview where applicable.

---

## 9. API ROUTES

All in `app/api/`:

```
/api/wazuh/alerts/route.ts              GET  — Proxy to Wazuh alerts API
/api/wazuh/agent-stats/route.ts         GET  — Agent health stats
/api/explain-alert/route.ts             POST — Alert ID → Groq streaming response
/api/generate-compliance-report/route.ts POST — Month → Gemini → LaTeX → PDF URL
/api/payments/bkash/create/route.ts     POST — Create bKash payment session
/api/payments/bkash/callback/route.ts   GET  — bKash redirect handler
/api/payments/nagad/create/route.ts     POST — Create Nagad payment session
/api/payments/nagad/callback/route.ts   GET  — Nagad redirect handler
/api/hrm/invite/route.ts                POST — Invite employee via Resend
/api/bounty/pay-researcher/route.ts     POST — Trigger bKash to researcher
/api/admin/users/route.ts               GET  — All users (service role)
/api/admin/revenue/route.ts             GET  — Revenue aggregates
/api/admin/send-email/route.ts          POST — Resend broadcast
/api/admin/announcements/route.ts       POST — Create/update announcements
/api/admin/grant-subscription/route.ts  POST — Grant free subscription
/api/webhooks/wazuh/route.ts            POST — Receive Wazuh webhooks from Python poller
```

All admin API routes must verify:
1. User is authenticated (Supabase session)
2. User email is in `ADMIN_AUTHORIZED_EMAILS`
3. If not, return `403 Forbidden`

---

## 10. SUPABASE EDGE FUNCTIONS

### `process-alert` (triggered by Wazuh webhook)
```typescript
// Input: { alert: WazuhAlert, company_id: string }
// 1. Insert alert into `alerts` table
// 2. If severity is 'critical' or 'high': trigger WhatsApp via Twilio + email via Resend
// 3. Update company's last_alert_at timestamp
```

### `explain-alert` (triggered by user clicking Ask AI)
```typescript
// Input: { alert_id: string, user_id: string }
// 1. Verify user owns this alert (RLS)
// 2. Fetch raw_log from alert
// 3. Call Groq with system prompt (see section 7.2)
// 4. Save AI explanation back to alert record
// 5. Return explanation text
```

### `generate-report` (monthly cron + manual trigger)
```typescript
// Input: { company_id: string, report_month: string }
// 1. Query all alerts for company for that month
// 2. Compile statistics
// 3. Call Gemini for AI summary
// 4. Fill LaTeX template
// 5. Generate PDF via node-latex
// 6. Upload to Supabase Storage
// 7. Save compliance_report record
// 8. Send email notification to company owner
```

### `bkash-callback`
```typescript
// Input: bKash redirect params (paymentID, status)
// 1. Verify payment with bKash API
// 2. Update subscription status in Supabase
// 3. Generate invoice PDF
// 4. Send confirmation email via Resend
// 5. Redirect to /billing?success=true
```

---

## 11. PYTHON SCRIPTS (for OCI/Azure VM)

### `scripts/wazuh-poller.py`
```python
# Runs every 60 seconds via cron
# 1. Calls Wazuh API: GET /security/events?limit=100&sort=-timestamp
# 2. Filters events newer than last poll timestamp (stored in local file)
# 3. For each new event:
#    a. Determines which company's agent generated it (via agent_id lookup in Supabase)
#    b. POST to /api/webhooks/wazuh with the alert data + company_id
# 4. Updates last poll timestamp
# Uses: requests, supabase-py, python-dotenv
```

### `scripts/monthly-report-job.py`
```python
# Runs on 1st of each month at 6 AM via cron
# 1. Queries Supabase for all active companies
# 2. For each company, calls /api/generate-compliance-report
# 3. Logs success/failure
# Uses: requests, schedule, python-dotenv
```

---

## 12. DESIGN SYSTEM

**Visual Identity:**
- **Primary color:** `#00D4A0` (Prohori Teal — trust, technology, Bangladesh)
- **Accent:** `#FF6B35` (Alert Orange — urgency, action)
- **Background (user portal):** Deep navy `#0A0E1A` with subtle grid texture
- **Background (admin portal):** Carbon `#0D0D0D` with dark sidebar
- **Success:** `#22C55E` | **Warning:** `#F59E0B` | **Critical:** `#EF4444`
- **Font Display:** `Syne` (headlines, bold, geometric)
- **Font Body:** `DM Sans` (readable, modern, clean)
- **Font Mono:** `JetBrains Mono` (logs, code, IDs)

**CSS Variables (globals.css):**
```css
:root {
  --color-primary: #00D4A0;
  --color-accent: #FF6B35;
  --color-bg: #0A0E1A;
  --color-surface: #111827;
  --color-surface-2: #1F2937;
  --color-border: #1F2937;
  --color-text: #F9FAFB;
  --color-text-muted: #6B7280;
  --radius: 12px;
  --radius-sm: 8px;
}
```

**UI Principles:**
- Cards use `backdrop-blur` with subtle border glow on hover.
- Severity badges: pill-shaped, color-coded with left accent bar.
- Tables have alternating subtle row backgrounds, hover highlight.
- All modals/slideouts use Framer Motion `AnimatePresence` with slide + fade.
- Loading states: skeleton screens (not spinners) for all data-dependent components.
- Responsive: mobile-first. Mobile sidebar converts to bottom tab bar.
- All real-time data shows a pulsing green dot when live-updating.
- Toast notifications via `react-hot-toast` for all user actions.

---

## 13. MIDDLEWARE (next.js middleware.ts)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const adminSegment = process.env.ADMIN_URL_SEGMENT!;
  const isAdminPath = req.nextUrl.pathname.startsWith(`/${adminSegment}`);
  const isDashboardPath = req.nextUrl.pathname.startsWith('/dashboard') ||
    ['/ai-analyst', '/compliance', '/bug-bounty', '/hrm', '/billing', '/settings'].some(
      p => req.nextUrl.pathname.startsWith(p)
    );

  // Protect user dashboard routes
  if (isDashboardPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect admin routes — email check is done in admin layout
  if (isAdminPath && !req.nextUrl.pathname.includes('/login') && !session) {
    return NextResponse.redirect(new URL(`/${adminSegment}/login`, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ai-analyst/:path*',
    '/compliance/:path*',
    '/bug-bounty/:path*',
    '/hrm/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 14. ERROR HANDLING RULES

- All API routes must return consistent error shape: `{ error: string, code: string, details?: any }`
- All client-side data fetches use React `Suspense` boundaries with skeleton fallbacks.
- All Wazuh API calls have a 10-second timeout with graceful degradation (show cached data + "Live data unavailable" banner).
- All AI API calls have 30-second timeout with retry (max 2 retries, exponential backoff).
- Payment webhooks must be idempotent (check if already processed before updating DB).
- Log all errors to Supabase `error_logs` table (create this table) with context: user_id, company_id, route, error message, stack trace.

---

## 15. SECURITY REQUIREMENTS

1. **Never expose Wazuh credentials to the client.** All Wazuh calls go through Next.js API routes.
2. **Admin URL segment** must never appear in client-side bundle, sitemap, or robots.txt.
3. **All admin API routes** verify admin email on every request (no caching of admin status).
4. **bKash/Nagad secrets** only in server-side code. Never in `NEXT_PUBLIC_` variables.
5. **SQL injection prevention:** Use parameterized queries only. Never string-concatenate SQL.
6. **CSRF protection:** Use Supabase session tokens. API routes validate `Authorization` header.
7. **Rate limiting:** Apply to `/api/explain-alert` (10 requests/hour per user) and payment endpoints (5 requests/hour per user).
8. **Input validation:** All form inputs validated with Zod schemas before processing.
9. **Audit trail:** All admin actions logged to `access_logs` with admin email + timestamp.
10. **Session timeout:** 8 hours for regular users, 2 hours for admin sessions.

---

## 16. IMPLEMENTATION ORDER (Follow Exactly)

**Phase 1 — Foundation (Day 1-2)**
- [ ] Initialize Next.js 14 project with TypeScript strict
- [ ] Configure Tailwind + shadcn/ui + Framer Motion
- [ ] Set up Supabase project + apply full schema migration
- [ ] Configure environment variables
- [ ] Implement Next.js middleware for route protection
- [ ] Build auth pages (login/signup) with Supabase Auth
- [ ] Create admin layout with email guard
- [ ] Build design system (CSS variables, typography, component tokens)

**Phase 2 — User Portal Core (Day 3-5)**
- [ ] User sidebar navigation
- [ ] Unified Security Dashboard (mock data first, then Wazuh)
- [ ] Wazuh API proxy routes
- [ ] AI Analyst page with Groq streaming
- [ ] Compliance Engine with PDF generation
- [ ] Billing page with bKash integration

**Phase 3 — User Portal Advanced (Day 6-7)**
- [ ] Bug Bounty Marketplace (company view + researcher view)
- [ ] HRM & Access Control
- [ ] Notification center
- [ ] Settings page (company profile, notification prefs)

**Phase 4 — Admin Portal (Day 8-10)**
- [ ] Admin dashboard with KPIs
- [ ] User management with slide-out detail
- [ ] Company management
- [ ] Subscription management
- [ ] Revenue analytics
- [ ] Announcements editor
- [ ] Email center (Resend integration)
- [ ] Promo code manager
- [ ] Content manager

**Phase 5 — Backend Automation (Day 11-12)**
- [ ] Supabase Edge Functions (all 4)
- [ ] Python Wazuh poller script
- [ ] Python monthly report cron script
- [ ] LaTeX compliance report template
- [ ] Twilio WhatsApp notifications

**Phase 6 — Polish & Testing (Day 13-14)**
- [ ] Mobile responsiveness audit
- [ ] Loading states + skeleton screens
- [ ] Error boundary implementation
- [ ] Rate limiting on API routes
- [ ] Security audit (env exposure, RLS testing)
- [ ] Performance: Lighthouse score > 85

---

## 17. PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@supabase/supabase-js": "^2",
    "@supabase/auth-helpers-nextjs": "^0.9",
    "tailwindcss": "^3",
    "framer-motion": "^11",
    "recharts": "^2",
    "lucide-react": "^0.400",
    "react-hook-form": "^7",
    "zod": "^3",
    "zustand": "^4",
    "date-fns": "^3",
    "groq-sdk": "^0.5",
    "@google/generative-ai": "^0.14",
    "resend": "^3",
    "twilio": "^5",
    "node-latex": "^3",
    "react-hot-toast": "^2",
    "@uiw/react-md-editor": "^4",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2"
  }
}
```

---

## 18. FINAL CHECKLIST FOR AGENT

Before declaring completion, verify:

- [ ] No `NEXT_PUBLIC_` prefix on any secret variable
- [ ] Admin URL segment not in any client component
- [ ] All Supabase tables have RLS enabled with policies
- [ ] All API routes validate session before processing
- [ ] Admin routes additionally validate email against `ADMIN_AUTHORIZED_EMAILS`
- [ ] All forms have Zod validation
- [ ] All pages have loading states
- [ ] Mobile navigation works on viewport < 768px
- [ ] PDF generation tested end-to-end
- [ ] bKash sandbox payment flow works (test mode)
- [ ] Groq streaming works in the AI analyst chat
- [ ] Announcements from admin appear on user dashboard
- [ ] Promo code discounts apply correctly in billing
- [ ] RLS tested: company A cannot see company B's data
- [ ] `.env.example` documents every variable used in the project
- [ ] `README.md` includes: setup instructions, env variable guide, Wazuh agent installation guide, admin portal access instructions

---

*End of Prohori Engineering Specification*
*Version: 1.0.0 | Target Stack: Next.js 14 + Supabase + Wazuh + Groq + Gemini*
