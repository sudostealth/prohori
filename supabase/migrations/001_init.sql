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
