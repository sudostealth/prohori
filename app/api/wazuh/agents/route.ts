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

export async function POST(request: NextRequest) {
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
        error: "Wazuh not connected",
        message: "Please configure your Wazuh connection in settings first"
      }, { status: 403 });
    }
    
    const { data: existingAgents } = await supabase
      .from('wazuh_agents')
      .select('*')
      .eq('company_id', company.id);

    const { agentName, osType } = await request.json();
    
    if (!agentName) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
    }

    const credentials = {
      api_url: wazuhConnection.api_url,
      api_username: wazuhConnection.api_username,
      api_password: simpleDecrypt(wazuhConnection.api_password_encrypted),
    };

    const client = new WazuhClient(credentials);
    const companyAgentName = `${company.name}-${agentName}`;

    const agentKey = await client.getAgentKey(companyAgentName);

    if (!agentKey) {
      return NextResponse.json({ 
        error: "Failed to generate agent key",
        message: "Could not register agent with Wazuh server. Check your connection settings." 
      }, { status: 500 });
    }

    const existingAgent = (existingAgents || []).find(a => a.agent_name === companyAgentName);

    if (existingAgent) {
      await supabase
        .from('wazuh_agents')
        .update({ 
          agent_key: agentKey,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAgent.id);
    } else {
      await supabase
        .from('wazuh_agents')
        .insert({
          company_id: company.id,
          agent_name: companyAgentName,
          agent_id: 0,
          agent_key: agentKey,
          status: 'pending',
          ip_address: 'pending',
          os_version: osType || 'Linux',
          wazuh_version: '',
          last_seen: new Date().toISOString(),
        });
    }

    await supabase
      .from('companies')
      .update({ server_connected: true })
      .eq('id', company.id);

    const wazuhManager = wazuhConnection.api_url.replace('https://', '').replace('http://', '').replace(':55000', '');

    return NextResponse.json({
      success: true,
      agentKey,
      agentName: companyAgentName,
      instructions: osType === 'windows' 
        ? getWindowsInstructions(companyAgentName, agentKey, wazuhManager)
        : getLinuxInstructions(wazuhManager),
    });
  } catch (error) {
    console.error("Error registering agent:", error);
    return NextResponse.json(
      { error: "Failed to register agent" },
      { status: 500 }
    );
  }
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

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (!user) {
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
        error: "Wazuh not connected",
        message: "Please configure your Wazuh connection in settings first"
      }, { status: 403 });
    }

    const { data: agents } = await supabase
      .from('wazuh_agents')
      .select('*')
      .eq('company_id', company.id);
    
    const credentials = {
      api_url: wazuhConnection.api_url,
      api_username: wazuhConnection.api_username,
      api_password: simpleDecrypt(wazuhConnection.api_password_encrypted),
    };

    const client = new WazuhClient(credentials);
    const wazuhAgents = await client.getAgents();

    const syncedAgents = await Promise.all((agents || []).map(async (agent) => {
      let wazuhStatus = 'pending';
      let lastSeen = agent.last_seen;
      
      if (agent.agent_id && agent.agent_id > 0) {
        const wazuhAgent = wazuhAgents.find((wa) => wa.id === agent.agent_id);
        if (wazuhAgent) {
          wazuhStatus = wazuhAgent.status;
          lastSeen = new Date(wazuhAgent.last_keepalive * 1000).toISOString();
          
          await supabase
            .from('wazuh_agents')
            .update({ 
              status: wazuhStatus as 'pending' | 'active' | 'disconnected',
              last_seen: lastSeen,
              os_version: wazuhAgent.group?.[0] || agent.os_version,
            })
            .eq('id', agent.id);
        }
      }
      
      return {
        ...agent,
        status: wazuhStatus,
        last_seen: lastSeen,
      };
    }));

    return NextResponse.json({
      agents: syncedAgents,
      stats: {
        total: syncedAgents.length,
        active: syncedAgents.filter((a) => a.status === 'active').length,
        disconnected: syncedAgents.filter((a) => a.status === 'disconnected').length,
        pending: syncedAgents.filter((a) => a.status === 'pending').length,
      },
      connectionStatus: wazuhConnection.connection_status,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

function getLinuxInstructions(wazuhManager: string): string {
  return `curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && \\
sudo bash wazuh-install.sh --wazuh-agent --wazuh-server ${wazuhManager}

sudo sed -i 's/MANAGER_IP/${wazuhManager}/g' /var/ossec/etc/ossec.conf
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent`;
}

function getWindowsInstructions(agentName: string, agentKey: string, wazuhManager: string): string {
  return `# Download Wazuh Agent for Windows
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.6.0-1.msi" -OutFile "wazuh-agent.msi"

# Install with your configuration
msiexec.exe /i wazuh-agent.msi /quiet \\
  WAZUH_MANAGER=${wazuhManager} \\
  WAZUH_AGENT_NAME=${agentName} \\
  WAZUH_REGISTRATION_SERVER=${wazuhManager} \\
  WAZUH_REGISTRATION_PASSWORD=${agentKey}

# Start the agent
Start-Service WazuhSvc`;
}