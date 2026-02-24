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
