'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
  if (!profile?.company_id) return null;

  // Get total threats blocked
  const { count: blockedCount } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.company_id)
    .eq('status', 'blocked');

  // Get online agents
  const { count: onlineCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.company_id)
    .eq('status', 'connected');

  return {
    blocked: blockedCount || 0,
    online: onlineCount || 0,
    status: (blockedCount || 0) > 0 ? 'secure' : 'secure' // Logic can be more complex
  };
}

export async function getRecentAlerts(limit = 5) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
  if (!profile?.company_id) return [];

  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getAgents() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
  if (!profile?.company_id) return [];

  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function syncWazuhAlerts() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
    if (!profile?.company_id) return { error: 'No company' };

    try {
        if (!process.env.WAZUH_API_BASE_URL || !process.env.WAZUH_API_USER || !process.env.WAZUH_API_PASSWORD) {
            return { error: 'Wazuh environment variables are missing' };
        }

        const auth = Buffer.from(`${process.env.WAZUH_API_USER}:${process.env.WAZUH_API_PASSWORD}`).toString('base64');
        const res = await fetch(`${process.env.WAZUH_API_BASE_URL}/alerts?limit=10`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) {
            console.error(`Wazuh API sync error: ${res.status}`);
            return { error: `Wazuh API returned ${res.status}` };
        }

        const json = await res.json();
        const wazuhAlerts = json.data?.data?.affected_items || [];

        let addedCount = 0;
        for (const alert of wazuhAlerts) {
            // Determine severity string based on Wazuh rule level
            let severity = 'low';
            if (alert.rule.level >= 12) severity = 'critical';
            else if (alert.rule.level >= 8) severity = 'high';
            else if (alert.rule.level >= 4) severity = 'medium';

            const newAlert = {
                company_id: profile.company_id,
                title: alert.rule.description || 'Unknown Alert',
                severity,
                source_ip: alert.srcip || alert.agent?.ip || 'Unknown',
                status: 'open',
                description: alert.full_log || alert.rule.description || 'No description provided.',
                created_at: alert.timestamp || new Date().toISOString()
            };

            // Basic check if already exists by timestamp and rule desc
            const { data: existing } = await supabase
                .from('alerts')
                .select('id')
                .eq('company_id', profile.company_id)
                .eq('created_at', newAlert.created_at)
                .eq('title', newAlert.title)
                .single();

            if (!existing) {
                await supabase.from('alerts').insert(newAlert);
                addedCount++;
            }
        }

        return { success: true, added: addedCount };
    } catch (err) {
        console.error('Failed to sync alerts from Wazuh:', err);
        return { error: 'Exception syncing alerts' };
    }
}

export async function syncWazuhAgents() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
    if (!profile?.company_id) return { error: 'No company' };

    try {
        if (!process.env.WAZUH_API_BASE_URL || !process.env.WAZUH_API_USER || !process.env.WAZUH_API_PASSWORD) {
            return { error: 'Wazuh environment variables are missing' };
        }

        const auth = Buffer.from(`${process.env.WAZUH_API_USER}:${process.env.WAZUH_API_PASSWORD}`).toString('base64');
        const res = await fetch(`${process.env.WAZUH_API_BASE_URL}/agents`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) {
            console.error(`Wazuh API agents sync error: ${res.status}`);
            return { error: `Wazuh API returned ${res.status}` };
        }

        const json = await res.json();
        const wazuhAgents = json.data?.data?.affected_items || [];

        let syncedCount = 0;
        for (const agent of wazuhAgents) {
            if (agent.id === "000") continue; // Skip wazuh manager itself if returned

            const mappedAgent = {
                company_id: profile.company_id,
                hostname: agent.name,
                ip_address: agent.ip,
                status: agent.status === 'active' ? 'connected' : 'disconnected',
                os_info: `${agent.os.name} ${agent.os.version}`,
                last_seen: agent.lastKeepAlive || new Date().toISOString()
            };

            const { data: existing } = await supabase
                .from('agents')
                .select('id')
                .eq('company_id', profile.company_id)
                .eq('hostname', agent.name)
                .single();

            if (existing) {
                await supabase.from('agents').update(mappedAgent).eq('id', existing.id);
            } else {
                await supabase.from('agents').insert(mappedAgent);
            }
            syncedCount++;
        }

        return { success: true, synced: syncedCount };
    } catch (err) {
        console.error('Failed to sync agents from Wazuh:', err);
        return { error: 'Exception syncing agents' };
    }
}
