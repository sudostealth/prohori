export type UserRole = "owner" | "admin" | "user" | "viewer" | "researcher";
export type SubscriptionStatus = "pending" | "approved" | "rejected";
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AlertStatus = "open" | "investigating" | "resolved" | "dismissed";
export type ContentType = "notification" | "popup" | "alert" | "banner";
export type ContentTarget = "landing" | "dashboard" | "both";
export type BillingCycle = "monthly" | "yearly";
export type PaymentMethod = "bkash" | "nagad" | "offline" | "card" | "bank";

// ── Specific sub-interfaces replacing generic Record<string, unknown> ─────────

/** Typed permissions map for HRM members */
export interface HrmPermissions {
  view_alerts?: boolean;
  manage_alerts?: boolean;
  view_reports?: boolean;
  manage_endpoints?: boolean;
  view_members?: boolean;
  manage_members?: boolean;
  view_billing?: boolean;
  [key: string]: boolean | undefined;
}

/** Tracks how much of each plan limit a company has consumed */
export interface LimitsUsed {
  servers?: number;
  users?: number;
  ai_queries?: number;
  api_calls?: number;
  storage?: number;
}

/** Structured details field for audit log entries */
export interface AuditDetails {
  previous_value?: unknown;
  new_value?: unknown;
  plan_id?: string;
  plan_name?: string;
  payment_method?: string;
  transaction_id?: string;
  rejection_reason?: string;
  coupon_code?: string;
  discount?: number;
  ip_address?: string;
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  company_id: string | null;
  display_name: string | null;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  status: "active" | "suspended" | "deleted";
  server_connected: boolean;
  max_endpoints: number;
  endpoints_count: number;
  compliance_score: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  features: string[];
  limits: {
    max_servers?: number;
    max_users?: number;
    max_alerts?: number;
    ai_queries?: number;
    storage_gb?: number;
  };
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRequest {
  id: string;
  company_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  payment_method: PaymentMethod | null;
  transaction_id: string | null;
  coupon_code: string | null;
  discount_amount: number;
  rejection_reason: string | null;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  subscription_plans?: SubscriptionPlan;
  companies?: Company;
}

export interface ActiveSubscription {
  id: string;
  company_id: string;
  plan_id: string;
  request_id: string;
  starts_at: string;
  expires_at: string | null;
  limits_used: LimitsUsed;
  created_at: string;
  subscription_plans?: SubscriptionPlan;
}

export interface CouponCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlatformContent {
  id: string;
  title: string;
  body: string | null;
  type: ContentType;
  target: ContentTarget;
  is_published: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface HrmMember {
  id: string;
  company_id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: Exclude<UserRole, "owner">;
  permissions: HrmPermissions;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  action: string;
  resource: string | null;
  details: AuditDetails;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  severity: AlertSeverity;
  source: string | null;
  status: AlertStatus;
  raw_log: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
}

export interface ServerMetric {
  id: string;
  company_id: string;
  server_name: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  status: "online" | "offline" | "warning";
  recorded_at: string;
}

export interface Endpoint {
  id: string;
  company_id: string;
  hostname: string;
  ip_address: string | null;
  os_type: string | null;
  agent_id: string | null;
  status: "active" | "disconnected" | "pending";
  last_seen: string;
  created_at: string;
}

export interface WazuhAgent {
  id: string;
  company_id: string | null;
  agent_name: string;
  agent_id: number | null;
  agent_key: string | null;
  status: "pending" | "active" | "disconnected" | "removed";
  ip_address: string | null;
  os_version: string | null;
  wazuh_version: string | null;
  last_seen: string | null;
  registration_token: string | null;
  created_at: string;
}

export interface WazuhAlert {
  id: string;
  company_id: string | null;
  wazuh_alert_id: number | null;
  timestamp: string | null;
  rule_id: number | null;
  rule_level: number | null;
  rule_description: string | null;
  rule_groups: string[] | null;
  agent_id: number | null;
  agent_name: string | null;
  agent_ip: string | null;
  full_log: string | null;
  location: string | null;
  severity: number | null;
  synced_at: string;
}

export interface UsageTracking {
  id: string;
  company_id: string | null;
  usage_type: "api_calls" | "servers" | "users" | "ai_queries" | "storage";
  count: number;
  period: "monthly" | "yearly";
  month: number | null;
  year: number | null;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  to_company_id: string | null;
  subject: string;
  template: string | null;
  method: "smtp" | "resend" | "supabase" | "direct";
  status: "sent" | "failed" | "pending";
  sent_by: string | null;
  sent_at: string;
}

export interface CompanyExtended extends Company {
  max_endpoints: number;
  endpoints_count: number;
  compliance_score: number;
}

export interface SubscriptionRequestExtended extends SubscriptionRequest {
  payment_method: "bkash" | "nagad" | "offline" | "card" | "bank" | null;
  transaction_id: string | null;
}

export interface WazuhConnection {
  id: string;
  company_id: string;
  name: string;
  api_url: string;
  api_username: string;
  api_password_encrypted: string;
  is_active: boolean;
  connection_status: "pending" | "connected" | "disconnected" | "error";
  last_error: string | null;
  last_connected: string | null;
  created_at: string;
  updated_at: string;
}

// ── Insert / Update helper types ─────────────────────────────────────────────

export type CompanyInsert = Pick<Company, 'name' | 'type' | 'owner_id'> &
  Partial<Pick<Company, 'status' | 'max_endpoints' | 'compliance_score'>>;

export type CompanyUpdate = Partial<
  Pick<Company, 'name' | 'type' | 'status' | 'server_connected' | 'max_endpoints' | 'compliance_score'>
>;

export type SubscriptionPlanInsert = Pick<
  SubscriptionPlan,
  'name' | 'price' | 'billing_cycle' | 'features' | 'limits'
> & Partial<Pick<SubscriptionPlan, 'is_published' | 'sort_order'>>;

export type SubscriptionPlanUpdate = Partial<
  Pick<SubscriptionPlan, 'name' | 'price' | 'billing_cycle' | 'features' | 'limits' | 'is_published' | 'sort_order'>
>;

export type HrmMemberInsert = Pick<HrmMember, 'company_id' | 'name' | 'email' | 'role' | 'created_by'> &
  Partial<Pick<HrmMember, 'user_id' | 'permissions' | 'is_active'>>;

export type HrmMemberUpdate = Partial<
  Pick<HrmMember, 'name' | 'email' | 'role' | 'permissions' | 'is_active'>
>;

