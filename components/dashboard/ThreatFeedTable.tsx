import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

const threats = [
  { id: 1, severity: 'critical', type: 'Malware Detected', source: '10.0.0.5 (Internal)', time: '2m ago', status: 'Blocked' },
  { id: 2, severity: 'high', type: 'Brute Force Attack', source: '45.33.22.11 (Russia)', time: '15m ago', status: 'Blocked' },
  { id: 3, severity: 'medium', type: 'Suspicious Port Scan', source: '192.168.1.102', time: '1h ago', status: 'Open' },
  { id: 4, severity: 'low', type: 'Failed Login', source: '192.168.1.50', time: '2h ago', status: 'Resolved' },
  { id: 5, severity: 'info', type: 'System Update', source: 'Localhost', time: '5h ago', status: 'Completed' },
];

export function ThreatFeedTable() {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-white">Live Threat Feed</CardTitle>
        <Button variant="outline" size="sm" className="h-8 text-xs border-dashed">View All Logs</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.map((threat) => (
            <div key={threat.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-surface-2 transition-colors border border-transparent hover:border-border">
              <div className="col-span-2">
                <Badge variant="outline" className={`badge-${threat.severity} uppercase text-[10px] border-0`}>
                  {threat.severity}
                </Badge>
              </div>
              <div className="col-span-4 font-medium text-sm text-white">
                {threat.type}
              </div>
              <div className="col-span-3 text-xs text-text-muted">
                {threat.source}
              </div>
              <div className="col-span-2 text-xs text-text-muted text-right">
                {threat.time}
              </div>
              <div className="col-span-1 flex justify-end">
                 <Link href={`/ai-analyst?alertId=${threat.id}`}>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10" title="Ask AI">
                        <BrainCircuit className="h-4 w-4" />
                    </Button>
                 </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
