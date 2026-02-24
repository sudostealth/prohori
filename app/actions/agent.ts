'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function getAgentInstallCommand() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.company_id) {
     throw new Error('No company found for user');
  }

  // Check if agent exists
  let { data: agent } = await supabase
    .from('agents')
    .select('install_token, id')
    .eq('company_id', profile.company_id)
    .limit(1)
    .maybeSingle();

  if (!agent) {
    // Create new agent placeholder
    // Note: wazuh_agent_id is NOT NULL in schema, so we need a placeholder or update schema
    // The schema says: wazuh_agent_id TEXT NOT NULL
    // I'll use a placeholder like 'pending'
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        company_id: profile.company_id,
        name: 'Primary Server',
        wazuh_agent_id: 'pending',
        status: 'pending'
      })
      .select('install_token, id')
      .single();

    if (error) {
        console.error('Error creating agent:', error);
        throw new Error('Failed to generate agent token');
    }
    agent = newAgent;
  }

  // Generate command
  // In a real scenario, this script would handle installing Wazuh agent and enrolling it with the token
  const installCommand = `curl -so install_agent.sh https://prohori.app/scripts/install_agent.sh && sudo bash install_agent.sh ${agent.install_token}`;

  return installCommand;
}

export async function checkAgentStatus() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return null;

  const { data: agent } = await supabase
    .from('agents')
    .select('status, last_seen')
    .eq('company_id', profile.company_id)
    .limit(1)
    .maybeSingle();

  return agent;
}
