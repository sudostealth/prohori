import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface WazuhAgentDB {
  id?: number;
  company_id: string;
  agent_name: string;
  agent_id: number;
  agent_key: string;
  status: 'pending' | 'active' | 'disconnected';
  ip_address: string;
  os_version: string;
  wazuh_version: string;
  last_seen: string;
  created_at?: string;
}

export interface WazuhAlertDB {
  id?: number;
  company_id: string;
  wazuh_alert_id: number;
  timestamp: string;
  rule_id: number;
  rule_level: number;
  rule_description: string;
  rule_groups: string[];
  agent_id: number;
  agent_name: string;
  agent_ip: string;
  full_log: string;
  location: string;
  severity: number;
  synced_at?: string;
}

export interface UsageTrackingDB {
  id?: number;
  company_id: string;
  usage_type: 'api_calls' | 'servers' | 'users' | 'ai_queries' | 'storage';
  count: number;
  period: 'monthly' | 'yearly';
  month: number;
  year: number;
  updated_at?: string;
}

export async function registerWazuhAgent(agent: Omit<WazuhAgentDB, 'id' | 'created_at'>): Promise<WazuhAgentDB | null> {
  const { data, error } = await supabase
    .from('wazuh_agents')
    .upsert(agent, { onConflict: 'company_id,agent_name' })
    .select()
    .single();

  if (error) {
    console.error('Error registering Wazuh agent:', error);
    return null;
  }
  return data;
}

export async function getCompanyAgents(companyId: string): Promise<WazuhAgentDB[]> {
  const { data, error } = await supabase
    .from('wazuh_agents')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting company agents:', error);
    return [];
  }
  return data || [];
}

export async function updateAgentStatus(agentId: number, status: 'pending' | 'active' | 'disconnected' | 'removed'): Promise<boolean> {
  const { error } = await supabase
    .from('wazuh_agents')
    .update({ 
      status: status,
      last_seen: new Date().toISOString()
    })
    .eq('agent_id', agentId);

  if (error) {
    console.error('Error updating agent status:', error);
    return false;
  }
  return true;
}

export async function saveWazuhAlerts(alerts: Omit<WazuhAlertDB, 'id' | 'synced_at'>[]): Promise<boolean> {
  if (alerts.length === 0) return true;

  const { error } = await supabase
    .from('wazuh_alerts')
    .upsert(alerts, { onConflict: 'company_id,wazuh_alert_id' });

  if (error) {
    console.error('Error saving Wazuh alerts:', error);
    return false;
  }
  return true;
}

export async function getCompanyAlerts(
  companyId: string, 
  limit: number = 100,
  severity?: number
): Promise<WazuhAlertDB[]> {
  let query = supabase
    .from('wazuh_alerts')
    .select('*')
    .eq('company_id', companyId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (severity) {
    query = query.gte('severity', severity);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting company alerts:', error);
    return [];
  }
  return data || [];
}

export async function trackUsage(
  companyId: string,
  usageType: UsageTrackingDB['usage_type'],
  increment: number = 1
): Promise<boolean> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('company_id', companyId)
    .eq('usage_type', usageType)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('usage_tracking')
      .update({ 
        count: existing.count + increment,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    return !error;
  } else {
    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        company_id: companyId,
        usage_type: usageType,
        count: increment,
        period: 'monthly',
        month,
        year,
      });

    return !error;
  }
}

export async function getUsage(
  companyId: string,
  usageType: UsageTrackingDB['usage_type']
): Promise<number> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('company_id', companyId)
    .eq('usage_type', usageType)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error || !data) return 0;
  return data.count;
}

export async function checkLimit(
  companyId: string,
  usageType: UsageTrackingDB['usage_type'],
  limit: number
): Promise<{ allowed: boolean; current: number; remaining: number }> {
  const current = await getUsage(companyId, usageType);
  return {
    allowed: current < limit,
    current,
    remaining: Math.max(0, limit - current),
  };
}

export async function getCompanySubscription(companyId: string) {
  const { data, error } = await supabase
    .from('active_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('company_id', companyId)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error) return null;
  return data;
}

export async function hasActiveSubscription(companyId: string): Promise<boolean> {
  const subscription = await getCompanySubscription(companyId);
  return subscription !== null;
}

export { supabase };
