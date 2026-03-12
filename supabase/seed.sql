-- =============================================================================
-- Prohori Database Seed Data
-- Run this in your Supabase SQL Editor after schema.sql
-- =============================================================================

-- =============================================================================
-- SUBSCRIPTION PLANS
-- =============================================================================

-- Free Plan
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Free',
  0,
  'monthly',
  '["1 Server", "5 Team Members", "Basic Alerts", "Email Support", "7-day Alert History"]'::JSONB,
  '{"max_servers": 1, "max_users": 5, "max_alerts": 100, "ai_queries": 5, "storage_gb": 1}'::JSONB,
  TRUE,
  0
) ON CONFLICT DO NOTHING;

-- Basic Plan - Monthly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Basic',
  29,
  'monthly',
  '["5 Servers", "20 Team Members", "Advanced Alerts", "AI Analyst", "Priority Support", "30-day Alert History", "Server Metrics"]'::JSONB,
  '{"max_servers": 5, "max_users": 20, "max_alerts": 1000, "ai_queries": 50, "storage_gb": 10}'::JSONB,
  TRUE,
  1
) ON CONFLICT DO NOTHING;

-- Pro Plan - Monthly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Pro',
  79,
  'monthly',
  '["25 Servers", "100 Team Members", "Real-time Alerts", "AI Analyst Pro", "24/7 Phone Support", "90-day Alert History", "Advanced Metrics", "Compliance Reports", "API Access"]'::JSONB,
  '{"max_servers": 25, "max_users": 100, "max_alerts": 10000, "ai_queries": 200, "storage_gb": 50}'::JSONB,
  TRUE,
  2
) ON CONFLICT DO NOTHING;

-- Enterprise Plan - Monthly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Enterprise',
  199,
  'monthly',
  '["Unlimited Servers", "Unlimited Team Members", "Real-time Alerts", "AI Analyst Unlimited", "Dedicated Support", "Unlimited History", "Advanced Metrics", "Full Compliance Suite", "API Access", "Custom Integrations", "SLA Guarantee"]'::JSONB,
  '{"max_servers": -1, "max_users": -1, "max_alerts": -1, "ai_queries": -1, "storage_gb": 500}'::JSONB,
  TRUE,
  3
) ON CONFLICT DO NOTHING;

-- Yearly Plans (20% discount)

-- Basic Yearly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000012',
  'Basic',
  278,
  'yearly',
  '["5 Servers", "20 Team Members", "Advanced Alerts", "AI Analyst", "Priority Support", "30-day Alert History", "Server Metrics"]'::JSONB,
  '{"max_servers": 5, "max_users": 20, "max_alerts": 1000, "ai_queries": 50, "storage_gb": 10}'::JSONB,
  TRUE,
  11
) ON CONFLICT DO NOTHING;

-- Pro Yearly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  'Pro',
  758,
  'yearly',
  '["25 Servers", "100 Team Members", "Real-time Alerts", "AI Analyst Pro", "24/7 Phone Support", "90-day Alert History", "Advanced Metrics", "Compliance Reports", "API Access"]'::JSONB,
  '{"max_servers": 25, "max_users": 100, "max_alerts": 10000, "ai_queries": 200, "storage_gb": 50}'::JSONB,
  TRUE,
  12
) ON CONFLICT DO NOTHING;

-- Enterprise Yearly
INSERT INTO subscription_plans (
  id,
  name,
  price,
  billing_cycle,
  features,
  limits,
  is_published,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000014',
  'Enterprise',
  1910,
  'yearly',
  '["Unlimited Servers", "Unlimited Team Members", "Real-time Alerts", "AI Analyst Unlimited", "Dedicated Support", "Unlimited History", "Advanced Metrics", "Full Compliance Suite", "API Access", "Custom Integrations", "SLA Guarantee"]'::JSONB,
  '{"max_servers": -1, "max_users": -1, "max_alerts": -1, "ai_queries": -1, "storage_gb": 500}'::JSONB,
  TRUE,
  13
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- COUPON CODES (Sample coupons)
-- =============================================================================

-- Welcome coupon - 20% off
INSERT INTO coupon_codes (
  id,
  code,
  discount_type,
  value,
  max_uses,
  expires_at
) VALUES (
  '00000000-0000-0000-0000-000000000101',
  'WELCOME20',
  'percentage',
  20,
  1000,
  NOW() + INTERVAL '90 days'
) ON CONFLICT DO NOTHING;

-- Launch promotion - 30% off
INSERT INTO coupon_codes (
  id,
  code,
  discount_type,
  value,
  max_uses,
  expires_at
) VALUES (
  '00000000-0000-0000-0000-000000000102',
  'LAUNCH30',
  'percentage',
  30,
  500,
  NOW() + INTERVAL '180 days'
) ON CONFLICT DO NOTHING;

-- Flat discount - $50 off
INSERT INTO coupon_codes (
  id,
  code,
  discount_type,
  value,
  max_uses,
  expires_at
) VALUES (
  '00000000-0000-0000-0000-000000000103',
  'SAVE50',
  'fixed',
  50,
  200,
  NOW() + INTERVAL '365 days'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- PLATFORM CONTENT (Sample announcements)
-- =============================================================================

INSERT INTO platform_content (
  id,
  title,
  body,
  type,
  target,
  is_published,
  priority
) VALUES (
  '00000000-0000-0000-0000-000000000201',
  'Welcome to Prohori!',
  'Get started with your security monitoring dashboard. Add your first server endpoint to begin receiving security alerts.',
  'notification',
  'dashboard',
  TRUE,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO platform_content (
  id,
  title,
  body,
  type,
  target,
  is_published,
  priority
) VALUES (
  '00000000-0000-0000-0000-000000000202',
  'New AI Analyst Feature',
  'Try our AI-powered security analyst to investigate alerts and get actionable insights.',
  'popup',
  'dashboard',
  TRUE,
  5
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFY SEED DATA
-- =============================================================================

SELECT 'Subscription Plans:' AS info;
SELECT name, billing_cycle, price, is_published FROM subscription_plans ORDER BY sort_order;

SELECT 'Coupon Codes:' AS info;
SELECT code, discount_type, value, max_uses, is_active FROM coupon_codes;

SELECT 'Platform Content:' AS info;
SELECT title, type, is_published FROM platform_content;
