import fetch, { RequestInit as NodeFetchRequestInit } from "node-fetch";
import https from "https";

interface WazuhCredentials {
  api_url: string;
  api_username: string;
  api_password: string;
}

interface WazuhAgent {
  id: number;
  name: string;
  ip: string;
  status: string;
  node_name: string;
  version: string;
  last_keepalive: number;
  group: string[];
}

interface WazuhAgentStats {
  cpu: number;
  memory: number;
  disk: string;
  network: {
    rx: number;
    tx: number;
  };
}

interface WazuhAlert {
  id: number;
  timestamp: string;
  rule: {
    id: number;
    level: number;
    description: string;
    groups: string[];
  };
  agent: {
    id: number;
    name: string;
    ip: string;
  };
  full_log: string;
  location: string;
  severity: number;
}

interface WazuhStats {
  totalAgents: number;
  activeAgents: number;
  pendingAgents: number;
  disconnectedAgents: number;
}

export class WazuhClient {
  private credentials: WazuhCredentials;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(credentials: WazuhCredentials) {
    this.credentials = credentials;
  }

  private getFetchOptions(options: NodeFetchRequestInit = {}): NodeFetchRequestInit {
    // Wazuh typically uses self-signed certificates.
    // By creating an https.Agent with rejectUnauthorized: false,
    // we instruct node-fetch to ignore SSL certificate validation errors.
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    return {
      ...options,
      agent,
    };
  }

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const url = `${this.credentials.api_url}/security/user/authenticate`;
    
    // Wazuh /security/user/authenticate expects Basic Auth or body params depending on version.
    // The standard way is Basic Auth.
    const authHeader = 'Basic ' + Buffer.from(`${this.credentials.api_username}:${this.credentials.api_password}`).toString('base64');

    try {
      const response = await fetch(url, this.getFetchOptions({
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }));

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errData = await response.json() as { message?: string };
          errorMsg = errData.message || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(`Wazuh authentication failed: ${response.status} ${errorMsg}`);
      }

      const data = await response.json() as { data?: { token?: string }, token?: string };

      // Wazuh returns data wrapped in { data: { token: "..." } } usually
      if (data && data.data && data.data.token) {
        this.token = data.data.token;
      } else if (data && data.token) {
        this.token = data.token;
      } else {
        throw new Error("Invalid token response from Wazuh");
      }

      this.tokenExpiry = Date.now() + 12 * 60 * 60 * 1000;
      return this.token as string;
    } catch (error) {
      if (error instanceof Error) {
         if (error.message.includes('fetch failed') || error.message.includes('unable to verify') || error.message.includes('ECONNREFUSED')) {
             throw new Error(`Wazuh connection failed: ${error.message}. Please check if the URL and port are accessible.`);
         }
      }
      throw error;
    }
  }

  private async request<T = unknown>(endpoint: string, options: NodeFetchRequestInit = {}): Promise<T> {
    const token = await this.authenticate();
    
    // Convert body to string if it's an object, as node-fetch requires a string body
    let finalBody = options.body;
    if (finalBody && typeof finalBody !== 'string') {
        finalBody = JSON.stringify(finalBody);
    }

    const fetchOptions = this.getFetchOptions({
      ...options,
      body: finalBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const response = await fetch(`${this.credentials.api_url}${endpoint}`, fetchOptions);

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errData = await response.json() as { message?: string, detail?: string };
        errorDetail = errData.detail || errData.message || errorDetail;
      } catch {
        // Ignore JSON parsing errors
      }
      throw new Error(`Wazuh API error: ${response.status} ${errorDetail}`);
    }

    return await response.json() as T;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authenticate();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getAgents(): Promise<WazuhAgent[]> {
    try {
      const data = await this.request<{ data: { affected_items?: WazuhAgent[] } }>('/agents');
      return data.data?.affected_items || [];
    } catch (error) {
      console.error('Error fetching Wazuh agents:', error);
      return [];
    }
  }

  async getAgent(agentId: number): Promise<WazuhAgent | null> {
    try {
      const data = await this.request<{ data: { affected_items?: [WazuhAgent] } }>(`/agents/${agentId}`);
      return data.data?.affected_items?.[0] || null;
    } catch (error) {
      console.error(`Error fetching Wazuh agent ${agentId}:`, error);
      return null;
    }
  }

  async getAgentStats(agentId: number): Promise<WazuhAgentStats | null> {
    try {
      const data = await this.request<{ data: { affected_items?: Array<Record<string, unknown>> } }>(`/agents/${agentId}/stats/overall`);
      if (data.data?.affected_items?.[0]) {
        const stats = data.data.affected_items[0] as Record<string, unknown>;
        const cpuData = stats?.cpu as Record<string, unknown> | undefined;
        const memData = stats?.memory as Record<string, unknown> | undefined;
        const diskData = stats?.disk as Record<string, unknown> | undefined;
        const netData = stats?.netinfo as Array<Record<string, unknown>> | undefined;
        return {
          cpu: (cpuData?.usage as number) || 0,
          memory: (memData?.usage_pct as number) || 0,
          disk: String((diskData?.usage_pct as number) || 0),
          network: {
            rx: (netData?.[0]?.rx as number) || 0,
            tx: (netData?.[0]?.tx as number) || 0,
          },
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching Wazuh agent stats ${agentId}:`, error);
      return null;
    }
  }

  async getAlerts(agentId?: number, limit: number = 100): Promise<WazuhAlert[]> {
    try {
      const endpoint = agentId 
        ? `/alerts/${agentId}?limit=${limit}`
        : `/alerts?limit=${limit}`;
      const data = await this.request<{ data: { affected_items?: WazuhAlert[] } }>(endpoint);
      return data.data?.affected_items || [];
    } catch (error) {
      console.error('Error fetching Wazuh alerts:', error);
      return [];
    }
  }

  async createAgentGroup(groupName: string): Promise<boolean> {
    try {
      await this.request('/groups', {
        method: 'POST',
        body: JSON.stringify({ id: groupName }),
      });
      return true;
    } catch (error) {
      console.error('Error creating Wazuh agent group:', error);
      return false;
    }
  }

  async getAgentKey(agentName: string): Promise<{ key: string | null; error?: string }> {
    try {
      // Wazuh 4.x /agents POST requires query parameters for some deployments or JSON body for others.
      // A common requirement is `name` and `ip` in the body or query.
      // We will supply it via the JSON body, explicitly restoring `ip: "any"` which is standard.
      const data = await this.request<{ data?: { affected_items?: Array<{ key?: string }> }; message?: string; error?: number }>('/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: agentName,
          ip: 'any'
        }),
      });
      
      if (data.data?.affected_items && data.data.affected_items.length > 0 && data.data.affected_items[0].key) {
        return { key: data.data.affected_items[0].key };
      }

      // If we got a 200 OK but it was an error format like { error: 1, message: 'Agent already exists' }
      if (data.error && data.error !== 0) {
         if (data.message && data.message.toLowerCase().includes('already exists')) {
             // Fallback: agent might already exist
            const agents = await this.getAgents();
            const existingAgent = agents.find(a => a.name === agentName);
            if (existingAgent) {
              const keyData = await this.request<{ data?: string }>(`/agents/${existingAgent.id}/key`);
              return { key: keyData.data || null };
            }
         }
         return { key: null, error: data.message || "Wazuh API returned an error" };
      }
      
      // Another Fallback: search for it anyway just in case
      const agents = await this.getAgents();
      const existingAgent = agents.find(a => a.name === agentName);
      if (existingAgent) {
        const keyData = await this.request<{ data?: string }>(`/agents/${existingAgent.id}/key`);
        return { key: keyData.data || null };
      }
      
      return { key: null, error: "Failed to parse key from Wazuh response" };
    } catch (error) {
      console.error('Error getting Wazuh agent key:', error);
      // Attempt fallback lookup on failure in case it actually succeeded but threw a timeout/parse error
      try {
          const agents = await this.getAgents();
          const existingAgent = agents.find(a => a.name === agentName);
          if (existingAgent) {
            const keyData = await this.request<{ data?: string }>(`/agents/${existingAgent.id}/key`);
            if (keyData.data) return { key: keyData.data };
          }
      } catch (fallbackError) {
          console.error("Fallback lookup also failed", fallbackError);
      }

      return { key: null, error: error instanceof Error ? error.message : "Unknown error connecting to Wazuh API" };
    }
  }

  async deleteAgent(agentId: number): Promise<boolean> {
    try {
      await this.request(`/agents/${agentId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting Wazuh agent ${agentId}:`, error);
      return false;
    }
  }

  async getStats(): Promise<WazuhStats> {
    try {
      const agents = await this.getAgents();
      return {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        pendingAgents: agents.filter(a => a.status === 'pending').length,
        disconnectedAgents: agents.filter(a => a.status === 'disconnected').length,
      };
    } catch (error) {
      console.error('Error fetching Wazuh stats:', error);
      return {
        totalAgents: 0,
        activeAgents: 0,
        pendingAgents: 0,
        disconnectedAgents: 0,
      };
    }
  }
}

export type { WazuhCredentials, WazuhAgent, WazuhAgentStats, WazuhAlert, WazuhStats };
