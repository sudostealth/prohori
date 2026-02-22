import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // Check if it's a valid Wazuh webhook payload
    if (!payload || !payload.rule) {
      return new Response('Invalid payload', { status: 400 });
    }

    const { rule, agent, location, full_log, timestamp } = payload;
    
    // Wazuh sends severity from 1 to 15. Map to High/Medium/Low
    let severity = 'Low';
    if (rule.level >= 10) severity = 'Critical';
    else if (rule.level >= 7) severity = 'High';
    else if (rule.level >= 4) severity = 'Medium';

    // In a real multi-tenant setup, match agent.id to tenant_id in the DB.
    // Assuming a mock tenant_id for demonstration purposes if agent mapping isn't set.
    const mockTenantId = '00000000-0000-0000-0000-000000000000'; // Replace with DB lookup

    const { error } = await supabase
      .from('alerts')
      .insert({
        tenant_id: mockTenantId,
        agent_name: agent?.name || 'Unknown',
        agent_id: agent?.id || 'Unknown',
        title: rule.description,
        description: full_log,
        severity: severity,
        rule_id: rule.id,
        location: location,
        status: 'Open',
        created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
