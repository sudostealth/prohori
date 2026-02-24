import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Alert } from '@/lib/types';

export function ThreatFeedTable({ alerts = [] }: { alerts?: Alert[] }) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-white">Live Threat Feed</CardTitle>
        <Button variant="outline" size="sm" className="h-8 text-xs border-dashed">View All Logs</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
             <div className="text-center text-text-muted py-4">No recent threats detected.</div>
          ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-surface-2 transition-colors border border-transparent hover:border-border">
              <div className="col-span-2">
                <Badge variant="outline" className={`badge-${alert.severity} uppercase text-[10px] border-0`}>
                  {alert.severity}
                </Badge>
              </div>
              <div className="col-span-4 font-medium text-sm text-white">
                {alert.title}
              </div>
              <div className="col-span-3 text-xs text-text-muted">
                {alert.source_ip || 'N/A'}
              </div>
              <div className="col-span-2 text-xs text-text-muted text-right">
                {new Date(alert.created_at).toLocaleTimeString()}
              </div>
              <div className="col-span-1 flex justify-end">
                 <Link href={`/ai-analyst?alertId=${alert.id}`}>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10" title="Ask AI">
                        <BrainCircuit className="h-4 w-4" />
                    </Button>
                 </Link>
              </div>
            </div>
          )))}
        </div>
      </CardContent>
    </Card>
  );
}
