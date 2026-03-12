-- =============================================================================
-- Prohori Database Schema
-- Consolidated Supabase/PostgreSQL Schema
-- Run this entire file in your Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: companies
-- Multi-tenant organization/company table
-- =============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SME',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  server_connected BOOLEAN DEFAULT FALSE,
  max_endpoints INTEGER DEFAULT 5,
  endpoints_count INTEGER DEFAULT 0,
  compliance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: profiles
-- User profiles linked to Supabase auth.users
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'user', 'viewer', 'researcher')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: subscription_plans
-- Pricing plans with features and limits
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  features JSONB DEFAULT '[]'::JSONB,
  limits JSONB DEFAULT '{}'::JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: subscription_requests
-- User requests to change/upgrade plans
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscription_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT CHECK (payment_method IN ('bkash', 'nagad', 'offline', 'card', 'bank')),
  transaction_id TEXT,
  coupon_code TEXT,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABLE: active_subscriptions
-- Currently active subscription per company
-- =============================================================================
CREATE TABLE IF NOT EXISTS active_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  request_id UUID REFERENCES subscription_requests(id),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  limits_used JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: coupon_codes
-- Discount coupons for subscriptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  max_uses INT,
  uses_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: platform_content
-- Announcements, popups, banners for users
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'notification' CHECK (type IN ('notification', 'popup', 'alert', 'banner')),
  target TEXT NOT NULL DEFAULT 'dashboard' CHECK (target IN ('landing', 'dashboard', 'both')),
  is_published BOOLEAN DEFAULT FALSE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: hrm_members
-- HRM - Team members within a company
-- =============================================================================
CREATE TABLE IF NOT EXISTS hrm_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer', 'researcher')),
  permissions JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: audit_logs
-- User activity audit trail
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: security_alerts
-- SIEM security alerts
-- =============================================================================
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  source TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  raw_log JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- =============================================================================
-- TABLE: server_metrics
-- Server CPU, memory, disk metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS server_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,
  cpu_percent NUMERIC(5,2) DEFAULT 0,
  memory_percent NUMERIC(5,2) DEFAULT 0,
  disk_percent NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning')),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: email_logs
-- Email delivery tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  to_company_id UUID REFERENCES companies(id),
  subject TEXT NOT NULL,
  template TEXT,
  method TEXT DEFAULT 'smtp' CHECK (method IN ('smtp', 'resend', 'supabase', 'direct')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: endpoints
-- Server/endpoint tracking for monitoring
-- =============================================================================
CREATE TABLE IF NOT EXISTS endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  os_type TEXT,
  agent_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'pending')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE: wazuh_agents
-- Wazuh agent registration
-- =============================================================================
CREATE TABLE IF NOT EXISTS wazuh_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_id INTEGER,
  agent_key TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disconnected', 'removed')),
  ip_address TEXT,
  os_version TEXT,
  wazuh_version TEXT,
  last_seen TIMESTAMPTZ,
  registration_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, agent_name)
);

-- =============================================================================
-- TABLE: wazuh_alerts
-- Imported Wazuh security alerts
-- =============================================================================
CREATE TABLE IF NOT EXISTS wazuh_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  wazuh_alert_id INTEGER,
  timestamp TIMESTAMPTZ,
  rule_id INTEGER,
  rule_level INTEGER,
  rule_description TEXT,
  rule_groups TEXT[],
  agent_id INTEGER,
  agent_name TEXT,
  agent_ip TEXT,
  full_log TEXT,
  location TEXT,
  severity INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, wazuh_alert_id)
);

-- =============================================================================
-- TABLE: usage_tracking
-- Monthly usage tracking per company
-- =============================================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('api_calls', 'servers', 'users', 'ai_queries', 'storage')),
  count INTEGER DEFAULT 0,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  month INTEGER,
  year INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, usage_type, month, year)
);

-- =============================================================================
-- TABLE: wazuh_connections
-- User's Wazuh server connection credentials (stored per company)
-- =============================================================================
CREATE TABLE IF NOT EXISTS wazuh_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Wazuh',
  api_url TEXT NOT NULL,
  api_username TEXT NOT NULL,
  api_password_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_connected TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'pending' CHECK (connection_status IN ('pending', 'connected', 'disconnected', 'error')),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE wazuh_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wazuh_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE wazuh_connections ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "companies_select_own" ON companies FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "companies_insert_own" ON companies FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "companies_update_own" ON companies FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "companies_select_member" ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM hrm_members WHERE user_id = auth.uid()));

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscription plans: published plans are public readable
CREATE POLICY "plans_select_published" ON subscription_plans FOR SELECT USING (is_published = TRUE);

-- Subscription requests: company owner
CREATE POLICY "sub_requests_select_own" ON subscription_requests FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "sub_requests_insert_own" ON subscription_requests FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Active subscriptions: company owner
CREATE POLICY "active_sub_select_own" ON active_subscriptions FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Coupon codes: company owner
CREATE POLICY "coupons_select_own" ON coupon_codes FOR SELECT
  USING (TRUE);

-- Platform content: published content is public
CREATE POLICY "content_select_published" ON platform_content FOR SELECT USING (is_published = TRUE);

-- HRM members: company members
CREATE POLICY "hrm_select_company" ON hrm_members FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY "hrm_insert_company" ON hrm_members FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "hrm_update_company" ON hrm_members FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "hrm_delete_company" ON hrm_members FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Audit logs: company owner
CREATE POLICY "audit_select_own" ON audit_logs FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "audit_insert_own" ON audit_logs FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Security alerts: company can read own
CREATE POLICY "alerts_select_own" ON security_alerts FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    OR company_id IN (SELECT company_id FROM hrm_members WHERE user_id = auth.uid()));
CREATE POLICY "alerts_insert_own" ON security_alerts FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "alerts_update_own" ON security_alerts FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Server metrics: company can read own
CREATE POLICY "metrics_select_own" ON server_metrics FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "metrics_insert_own" ON server_metrics FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Endpoints: company can read own
CREATE POLICY "endpoints_select_own" ON endpoints FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "endpoints_insert_own" ON endpoints FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "endpoints_update_own" ON endpoints FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "endpoints_delete_own" ON endpoints FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Wazuh agents: company can manage own
CREATE POLICY "wazuh_agents_select_own" ON wazuh_agents FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    OR company_id IN (SELECT company_id FROM hrm_members WHERE user_id = auth.uid()));
CREATE POLICY "wazuh_agents_insert_own" ON wazuh_agents FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "wazuh_agents_update_own" ON wazuh_agents FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "wazuh_agents_delete_own" ON wazuh_agents FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Wazuh alerts: company can read own
CREATE POLICY "wazuh_alerts_select_own" ON wazuh_alerts FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    OR company_id IN (SELECT company_id FROM hrm_members WHERE user_id = auth.uid()));

-- Usage tracking: company can manage own
CREATE POLICY "usage_select_own" ON usage_tracking FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "usage_insert_own" ON usage_tracking FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "usage_update_own" ON usage_tracking FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Wazuh connections: company owner can manage own
CREATE POLICY "wazuh_connections_select_own" ON wazuh_connections FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "wazuh_connections_insert_own" ON wazuh_connections FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "wazuh_connections_update_own" ON wazuh_connections FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "wazuh_connections_delete_own" ON wazuh_connections FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_company ON subscription_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_company ON active_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_hrm_members_company ON hrm_members(company_id);
CREATE INDEX IF NOT EXISTS idx_hrm_members_user ON hrm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_company ON security_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_metrics_company ON server_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_server_metrics_recorded ON server_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_endpoints_company ON endpoints(company_id);
CREATE INDEX IF NOT EXISTS idx_endpoints_status ON endpoints(status);
CREATE INDEX IF NOT EXISTS idx_wazuh_agents_company ON wazuh_agents(company_id);
CREATE INDEX IF NOT EXISTS idx_wazuh_agents_status ON wazuh_agents(status);
CREATE INDEX IF NOT EXISTS idx_wazuh_alerts_company_time ON wazuh_alerts(company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wazuh_alerts_severity ON wazuh_alerts(severity) WHERE severity >= 7;
CREATE INDEX IF NOT EXISTS idx_usage_company_type ON usage_tracking(company_id, usage_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_company ON email_logs(to_company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_wazuh_connections_company ON wazuh_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_wazuh_connections_active ON wazuh_connections(is_active);

-- =============================================================================
-- TRIGGERS & FUNCTIONS
-- =============================================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'), 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON platform_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wazuh_connections_updated_at BEFORE UPDATE ON wazuh_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
