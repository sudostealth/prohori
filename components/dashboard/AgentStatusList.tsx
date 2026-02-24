import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle, Server } from 'lucide-react';

export function AgentStatusList({ agents = [] }: { agents?: any[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center text-text-muted py-4">No agents installed.</div>
          ) : (
          agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2/20 border border-border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${agent.status === 'connected' ? 'bg-green-500/10 text-green-500' : 'bg-surface-2 text-text-muted'}`}>
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{agent.name}</div>
                  <div className="text-xs text-text-muted">{agent.ip_address || 'Waiting for IP...'}</div>
                </div>
              </div>
              <Badge variant="outline" className={
                agent.status === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                agent.status === 'disconnected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }>
                 {agent.status}
              </Badge>
            </div>
          )))}
        </div>
      </CardContent>
    </Card>
  );
}
