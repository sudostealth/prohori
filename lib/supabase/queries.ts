import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type {
  Company,
  Profile,
  SubscriptionPlan,
  SubscriptionRequest,
  // ActiveSubscription, // reserved for future use
  CouponCode,
  PlatformContent,
  HrmMember,
  AuditLog,
  SecurityAlert,
  ServerMetric,
} from '@/types';

type CookieOptions = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function getCookieStore() {
  return cookies();
}

export function createSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createSupabaseServerClient() {
  const cookieStore = getCookieStore();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptions[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            );
          } catch {}
        },
      },
    }
  );
}

export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =============================================================================
// COMPANY QUERIES
// =============================================================================

export const companyQueries = {
  async getByOwnerId(ownerId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('companies')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(data: Partial<Company>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('companies')
      .insert(data)
      .select()
      .single();
  },

  async update(id: string, data: Partial<Company>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('companies')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async updateEndpointCount(id: string, increment: number = 1) {
    const supabase = createSupabaseClient();
    return supabase
      .from('companies')
      .update({ endpoints_count: increment })
      .eq('id', id)
      .select();
  },
};

// =============================================================================
// PROFILE QUERIES
// =============================================================================

export const profileQueries = {
  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
  },

  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId);
  },

  async update(id: string, data: Partial<Profile>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },
};

// =============================================================================
// SUBSCRIPTION PLAN QUERIES
// =============================================================================

export const planQueries = {
  async getAll() {
    const cached = cache.get<{ data: SubscriptionPlan[] | null; error: unknown }>(CACHE_KEYS.PLANS_ALL);
    if (cached) return cached;

    const supabase = createSupabaseClient();
    const result = await supabase
      .from('subscription_plans')
      .select('id, name, price, billing_cycle, features, limits, is_published, sort_order, created_at, updated_at')
      .eq('is_published', true)
      .order('sort_order');

    if (!result.error) {
      cache.set(CACHE_KEYS.PLANS_ALL, result, CACHE_TTL.PLANS);
    }
    return result;
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();
  },

  async getByBillingCycle(billingCycle: 'monthly' | 'yearly') {
    const cacheKey = billingCycle === 'monthly' ? CACHE_KEYS.PLANS_MONTHLY : CACHE_KEYS.PLANS_YEARLY;
    const cached = cache.get<{ data: SubscriptionPlan[] | null; error: unknown }>(cacheKey);
    if (cached) return cached;

    const supabase = createSupabaseClient();
    const result = await supabase
      .from('subscription_plans')
      .select('id, name, price, billing_cycle, features, limits, is_published, sort_order, created_at, updated_at')
      .eq('is_published', true)
      .eq('billing_cycle', billingCycle)
      .order('sort_order');

    if (!result.error) {
      cache.set(cacheKey, result, CACHE_TTL.PLANS);
    }
    return result;
  },

  async create(data: Partial<SubscriptionPlan>) {
    const supabase = createSupabaseClient();
    const result = await supabase
      .from('subscription_plans')
      .insert(data)
      .select()
      .single();
    // Invalidate plan cache
    cache.invalidatePrefix('plans:');
    return result;
  },

  async update(id: string, data: Partial<SubscriptionPlan>) {
    const supabase = createSupabaseClient();
    const result = await supabase
      .from('subscription_plans')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    // Invalidate plan cache
    cache.invalidatePrefix('plans:');
    return result;
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    const result = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);
    // Invalidate plan cache
    cache.invalidatePrefix('plans:');
    return result;
  },
};

// =============================================================================
// SUBSCRIPTION REQUEST QUERIES
// =============================================================================

export const subscriptionRequestQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('subscription_requests')
      .select('*, plan:subscription_plans(*)')
      .eq('company_id', companyId)
      .order('requested_at', { ascending: false });
  },

  async getPending() {
    const supabase = createSupabaseClient();
    return supabase
      .from('subscription_requests')
      .select('*, plan:subscription_plans(*), company:companies(*)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });
  },

  async create(data: Partial<SubscriptionRequest>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('subscription_requests')
      .insert(data)
      .select()
      .single();
  },

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    resolvedBy: string,
    rejectionReason?: string
  ) {
    const supabase = createSupabaseClient();
    return supabase
      .from('subscription_requests')
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        rejection_reason: rejectionReason,
      })
      .eq('id', id)
      .select()
      .single();
  },
};

// =============================================================================
// ACTIVE SUBSCRIPTION QUERIES
// =============================================================================

export const activeSubscriptionQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('active_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('company_id', companyId)
      .single();
  },

  async getActiveByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('active_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('company_id', companyId)
      .gte('expires_at', new Date().toISOString())
      .single();
  },

  async create(data: {
    company_id: string;
    plan_id: string;
    request_id?: string;
    expires_at?: string;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('active_subscriptions')
      .upsert(data)
      .select()
      .single();
  },

  async updateLimits(companyId: string, limitsUsed: Record<string, number>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('active_subscriptions')
      .update({ limits_used: limitsUsed })
      .eq('company_id', companyId)
      .select()
      .single();
  },

  async cancel(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('active_subscriptions')
      .delete()
      .eq('company_id', companyId);
  },
};

// =============================================================================
// COUPON QUERIES
// =============================================================================

export const couponQueries = {
  async validate(code: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
  },

  async getAll() {
    const supabase = createSupabaseClient();
    return supabase
      .from('coupon_codes')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async create(data: Partial<CouponCode>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('coupon_codes')
      .insert({ ...data, code: data.code?.toUpperCase() })
      .select()
      .single();
  },

  async incrementUsage(id: string) {
    // FIX: was incorrectly setting uses_count to literal 1 on every call.
    // Now correctly increments using a read-modify-write with the current count.
    const supabase = createSupabaseClient();
    const { data: coupon, error } = await supabase
      .from('coupon_codes')
      .select('uses_count')
      .eq('id', id)
      .single();
    if (error || !coupon) return { data: null, error: error || new Error('Coupon not found') };
    return supabase
      .from('coupon_codes')
      .update({ uses_count: coupon.uses_count + 1 })
      .eq('id', id)
      .select();
  },
};

// =============================================================================
// PLATFORM CONTENT QUERIES
// =============================================================================

export const contentQueries = {
  async getPublished(target?: 'landing' | 'dashboard' | 'both') {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('platform_content')
      .select('*')
      .eq('is_published', true)
      .order('priority', { ascending: false });

    if (target) {
      query = query.or(`target.eq.${target},target.eq.both`);
    }

    return query;
  },

  async getAll() {
    const supabase = createSupabaseClient();
    return supabase
      .from('platform_content')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async create(data: Partial<PlatformContent>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('platform_content')
      .insert(data)
      .select()
      .single();
  },

  async update(id: string, data: Partial<PlatformContent>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('platform_content')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('platform_content')
      .delete()
      .eq('id', id);
  },
};

// =============================================================================
// HRM MEMBER QUERIES
// =============================================================================

export const hrmQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(data: Partial<HrmMember>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .insert(data)
      .select()
      .single();
  },

  async update(id: string, data: Partial<HrmMember>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .delete()
      .eq('id', id);
  },

  async setInactive(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('hrm_members')
      .update({ is_active: false })
      .eq('id', id)
      .select();
  },
};

// =============================================================================
// AUDIT LOG QUERIES
// =============================================================================

export const auditQueries = {
  async getByCompanyId(companyId: string, limit: number = 50) {
    const supabase = createSupabaseClient();
    return supabase
      .from('audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async create(data: Partial<AuditLog>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('audit_logs')
      .insert(data)
      .select()
      .single();
  },
};

// =============================================================================
// SECURITY ALERT QUERIES
// =============================================================================

export const alertQueries = {
  async getByCompanyId(
    companyId: string,
    options?: {
      severity?: string;
      status?: string;
      limit?: number;
    }
  ) {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('security_alerts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (options?.severity) {
      query = query.eq('severity', options.severity);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('security_alerts')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(data: Partial<SecurityAlert>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('security_alerts')
      .insert(data)
      .select()
      .single();
  },

  async updateStatus(
    id: string,
    status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  ) {
    const supabase = createSupabaseClient();
    return supabase
      .from('security_alerts')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();
  },

  async getStats(companyId: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('security_alerts')
      .select('severity, status')
      .eq('company_id', companyId);

    if (error) return null;

    const stats = {
      total: data.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      investigating: 0,
      resolved: 0,
    };

    data.forEach((alert) => {
      if (alert.severity in stats) {
        stats[alert.severity as keyof typeof stats]++;
      }
      if (alert.status in stats) {
        stats[alert.status as keyof typeof stats]++;
      }
    });

    return stats;
  },
};

// =============================================================================
// SERVER METRIC QUERIES
// =============================================================================

export const metricQueries = {
  async getByCompanyId(
    companyId: string,
    options?: { serverName?: string; limit?: number }
  ) {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('server_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('recorded_at', { ascending: false });

    if (options?.serverName) {
      query = query.eq('server_name', options.serverName);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  },

  async getLatest(companyId: string, serverName?: string) {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('server_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (serverName) {
      query = query.eq('server_name', serverName);
    }

    return query.single();
  },

  async create(data: Partial<ServerMetric>) {
    const supabase = createSupabaseClient();
    return supabase
      .from('server_metrics')
      .insert(data)
      .select()
      .single();
  },
};

// =============================================================================
// ENDPOINT QUERIES
// =============================================================================

export const endpointQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .select('*')
      .eq('id', id)
      .single();
  },

  async getByAgentId(agentId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .select('*')
      .eq('agent_id', agentId)
      .single();
  },

  async create(data: {
    company_id: string;
    hostname: string;
    ip_address?: string;
    os_type?: string;
    agent_id?: string;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .insert(data)
      .select()
      .single();
  },

  async updateStatus(
    id: string,
    status: 'active' | 'disconnected' | 'pending'
  ) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .update({ status, last_seen: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  async updateLastSeen(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', id)
      .select();
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('endpoints')
      .delete()
      .eq('id', id);
  },
};

// =============================================================================
// WAZUH AGENT QUERIES
// =============================================================================

export const wazuhAgentQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_agents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_agents')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(data: {
    company_id: string;
    agent_name: string;
    status?: 'pending' | 'active' | 'disconnected' | 'removed';
    ip_address?: string;
    os_version?: string;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_agents')
      .insert(data)
      .select()
      .single();
  },

  async updateStatus(
    id: string,
    status: 'pending' | 'active' | 'disconnected' | 'removed'
  ) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_agents')
      .update({ status, last_seen: status === 'active' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_agents')
      .delete()
      .eq('id', id);
  },
};

// =============================================================================
// WAZUH ALERT QUERIES
// =============================================================================

export const wazuhAlertQueries = {
  async getByCompanyId(
    companyId: string,
    options?: {
      minSeverity?: number;
      agentId?: number;
      limit?: number;
    }
  ) {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('wazuh_alerts')
      .select('*')
      .eq('company_id', companyId)
      .order('timestamp', { ascending: false });

    if (options?.minSeverity) {
      query = query.gte('severity', options.minSeverity);
    }
    if (options?.agentId) {
      query = query.eq('agent_id', options.agentId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  },

  async create(data: {
    company_id: string;
    wazuh_alert_id: number;
    timestamp: string;
    rule_id: number;
    rule_level: number;
    rule_description: string;
    agent_id: number;
    agent_name: string;
    agent_ip: string;
    full_log: string;
    location: string;
    severity: number;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_alerts')
      .upsert(data, { onConflict: 'company_id, wazuh_alert_id' })
      .select()
      .single();
  },
};

// =============================================================================
// WAZUH CONNECTION QUERIES
// =============================================================================

export interface WazuhConnection {
  id: string;
  company_id: string;
  name: string;
  api_url: string;
  api_username: string;
  api_password_encrypted: string;
  is_active: boolean;
  connection_status: 'pending' | 'connected' | 'disconnected' | 'error';
  last_error: string | null;
  last_connected: string | null;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENCRYPTION_KEY = process.env.WAZUH_ENCRYPTION_KEY || 'prohori-default-encryption-key-change-me';

// Legacy XOR functions removed — now using AES-256-GCM via lib/encryption.ts
// The `encrypt` and `decrypt` imports at the top of this file handle all encryption.

export const wazuhConnectionQueries = {
  async getByCompanyId(companyId: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_connections')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();
  },

  async getById(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_connections')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(data: {
    company_id: string;
    name: string;
    api_url: string;
    api_username: string;
    api_password: string;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_connections')
      .insert({
        company_id: data.company_id,
        name: data.name,
        api_url: data.api_url,
        api_username: data.api_username,
        api_password_encrypted: encrypt(data.api_password),
        is_active: true,
        connection_status: 'pending',
      })
      .select()
      .single();
  },

  async update(id: string, data: {
    name?: string;
    api_url?: string;
    api_username?: string;
    api_password?: string;
  }) {
    const supabase = createSupabaseClient();
    const updateData: Record<string, unknown> = {};
    
    if (data.name) updateData.name = data.name;
    if (data.api_url) updateData.api_url = data.api_url;
    if (data.api_username) updateData.api_username = data.api_username;
    if (data.api_password) updateData.api_password_encrypted = encrypt(data.api_password);

    return supabase
      .from('wazuh_connections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
  },

  async updateStatus(id: string, status: 'pending' | 'connected' | 'disconnected' | 'error', error?: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_connections')
      .update({
        connection_status: status,
        last_error: error || null,
        last_connected: status === 'connected' ? new Date().toISOString() : undefined,
      })
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    const supabase = createSupabaseClient();
    return supabase
      .from('wazuh_connections')
      .delete()
      .eq('id', id);
  },

  async getDecryptedPassword(connection: WazuhConnection): Promise<string> {
    return decrypt(connection.api_password_encrypted);
  },
};

// =============================================================================
// USAGE TRACKING QUERIES
// =============================================================================

export const usageQueries = {
  async getByCompanyId(companyId: string, month?: number, year?: number) {
    const supabase = createSupabaseClient();
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    return supabase
      .from('usage_tracking')
      .select('*')
      .eq('company_id', companyId)
      .eq('month', targetMonth)
      .eq('year', targetYear);
  },

  async increment(
    companyId: string,
    usageType: 'api_calls' | 'servers' | 'users' | 'ai_queries' | 'storage',
    amount: number = 1
  ) {
    const supabase = createSupabaseClient();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('id, count')
      .eq('company_id', companyId)
      .eq('usage_type', usageType)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existing) {
      return supabase
        .from('usage_tracking')
        .update({
          count: existing.count + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return supabase
        .from('usage_tracking')
        .insert({
          company_id: companyId,
          usage_type: usageType,
          count: amount,
          period: 'monthly',
          month,
          year,
        })
        .select()
        .single();
    }
  },

  async checkLimit(
    companyId: string,
    usageType: 'api_calls' | 'servers' | 'users' | 'ai_queries' | 'storage',
    planLimits: Record<string, number>
  ) {
    const supabase = createSupabaseClient();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const limit = planLimits[usageType];

    if (limit === -1 || limit === undefined) {
      return { allowed: true, current: 0, limit: -1 };
    }

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('company_id', companyId)
      .eq('usage_type', usageType)
      .eq('month', month)
      .eq('year', year)
      .single();

    const current = usage?.count || 0;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  },
};

// =============================================================================
// EMAIL LOG QUERIES
// =============================================================================

export const emailLogQueries = {
  async getByCompanyId(companyId: string, limit: number = 50) {
    const supabase = createSupabaseClient();
    return supabase
      .from('email_logs')
      .select('*')
      .eq('to_company_id', companyId)
      .order('sent_at', { ascending: false })
      .limit(limit);
  },

  async create(data: {
    to_email: string;
    to_company_id?: string;
    subject: string;
    template?: string;
    method?: 'smtp' | 'resend' | 'supabase' | 'direct';
    status?: 'sent' | 'failed' | 'pending';
    sent_by?: string;
  }) {
    const supabase = createSupabaseClient();
    return supabase
      .from('email_logs')
      .insert(data)
      .select()
      .single();
  },
};
