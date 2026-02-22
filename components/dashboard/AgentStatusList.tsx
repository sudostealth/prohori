import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Laptop, Server } from 'lucide-react';

const agents = [
  { id: 1, name: 'Web Server 01', os: 'Ubuntu 22.04', ip: '10.0.0.5', status: 'connected', lastSeen: 'Just now' },
  { id: 2, name: 'DB Server', os: 'CentOS 8', ip: '10.0.0.6', status: 'connected', lastSeen: '2m ago' },
  { id: 3, name: 'Office Workstation', os: 'Windows 11', ip: '192.168.1.50', status: 'disconnected', lastSeen: '2d ago' },
];

export function AgentStatusList() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Connected Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-2 transition-colors border border-transparent hover:border-border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${agent.status === 'connected' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {agent.os.includes('Windows') ? <Laptop className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white">{agent.name}</h4>
                  <p className="text-xs text-text-muted">{agent.ip} • {agent.os}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={agent.status === 'connected' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                  {agent.status}
                </Badge>
                <p className="text-xs text-text-muted mt-1">{agent.lastSeen}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
