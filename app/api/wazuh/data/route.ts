import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WazuhClient } from "@/lib/wazuh/client";
import { getWazuhConnection } from "@/lib/wazuh/connection";

export const dynamic = 'force-dynamic';

function simpleDecrypt(encrypted: string): string {
  const key = (process.env.WAZUH_ENCRYPTION_KEY || 'prohori-default-encryption-key-change-me').slice(0, 32).padEnd(32, '0');
  const decoded = Buffer.from(encrypted, 'base64').toString('binary');
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const wazuhConnection = await getWazuhConnection(company.id);
    if (!wazuhConnection) {
      return NextResponse.json({
        connected: false,
        agents: [],
        metrics: { cpu: 0, memory: 0, disk: 0 },
        alerts: [],
        stats: { total: 0, active: 0, disconnected: 0 },
        connectionRequired: true,
      });
    }

    const { data: wazuhAgents } = await supabase
      .from("wazuh_agents")
      .select("*")
      .eq("company_id", company.id)
      .eq("status", "active");

    if (!wazuhAgents || wazuhAgents.length === 0) {
      return NextResponse.json({
        connected: true,
        agents: [],
        metrics: { cpu: 0, memory: 0, disk: 0 },
        alerts: [],
        stats: { total: 0, active: 0, disconnected: 0 },
        connectionStatus: wazuhConnection.connection_status,
      });
    }

    const credentials = {
      api_url: wazuhConnection.api_url,
      api_username: wazuhConnection.api_username,
      api_password: simpleDecrypt(wazuhConnection.api_password_encrypted),
    };
    
    const client = new WazuhClient(credentials);
    const wazuhAgentsList = await client.getAgents();
    const companyAgentIds = wazuhAgents.map((a) => a.agent_id);
    const relevantAgents = wazuhAgentsList.filter((a) => 
      companyAgentIds.includes(a.id)
    );

    let metrics = { cpu: 0, memory: 0, disk: 0 };
    interface WazuhAlertType {
      id: number;
      timestamp: string;
      severity: number;
      rule?: { description?: string };
      agent?: { name?: string };
      full_log?: string;
    }
    let alerts: WazuhAlertType[] = [];

    if (relevantAgents.length > 0) {
      const primaryAgent = relevantAgents[0];
      const stats = await client.getAgentStats(primaryAgent.id);
      if (stats) {
        metrics = {
          cpu: stats.cpu || 0,
          memory: stats.memory || 0,
          disk: typeof stats.disk === 'number' ? stats.disk : parseFloat(stats.disk) || 0,
        };
      }
      alerts = await client.getAlerts(primaryAgent.id, 20);
    }

    return NextResponse.json({
      connected: true,
      agents: relevantAgents,
      metrics,
      alerts: alerts.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        severity: a.severity,
        rule_description: a.rule?.description,
        agent_name: a.agent?.name,
        full_log: a.full_log,
      })),
      stats: {
        total: relevantAgents.length,
        active: relevantAgents.filter((a) => a.status === "active").length,
        disconnected: relevantAgents.filter((a) => a.status === "disconnected").length,
      },
      connectionStatus: wazuhConnection.connection_status,
    });
  } catch (error) {
    console.error("Error fetching Wazuh data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Wazuh data" },
      { status: 500 }
    );
  }
}
