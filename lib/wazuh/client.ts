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

interface WazuhAuthResponse {
  token: string;
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

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const url = `${this.credentials.api_url}/security/user/authenticate`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.credentials.api_username,
        password: this.credentials.api_password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Wazuh authentication failed: ${response.statusText}`);
    }

    const data: WazuhAuthResponse = await response.json();
    this.token = data.token;
    this.tokenExpiry = Date.now() + 12 * 60 * 60 * 1000;
    return this.token;
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.credentials.api_url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Wazuh API error: ${response.statusText}`);
    }

    return response.json() as T;
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

  async getAgentKey(agentName: string): Promise<string | null> {
    try {
      const data = await this.request<{ data: { affected_items?: Array<{ key?: string }> } }>('/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: agentName,
          ip: 'any',
          force_time: 3600,
        }),
      });
      
      if (data.data?.affected_items?.[0]?.key) {
        return data.data.affected_items[0].key;
      }
      
      const agents = await this.getAgents();
      const existingAgent = agents.find(a => a.name === agentName);
      if (existingAgent) {
        const keyData = await this.request<{ data: string }>(`/agents/${existingAgent.id}/key`);
        return keyData.data || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Wazuh agent key:', error);
      return null;
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
