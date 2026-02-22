import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function ComplianceSummaryCard({
  title,
  score,
  status,
  issues
}: {
  title: string,
  score: number,
  status: 'compliant' | 'warning' | 'non-compliant',
  issues: number
}) {
  const config = {
    compliant: { color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10' },
    warning: { color: 'text-yellow-500', icon: AlertTriangle, bg: 'bg-yellow-500/10' },
    'non-compliant': { color: 'text-red-500', icon: XCircle, bg: 'bg-red-500/10' }
  }[status];

  const Icon = config.icon;

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-text-muted">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", config.color)} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
            <div>
               <div className="text-2xl font-bold font-display text-white">{score}%</div>
               <p className="text-xs text-text-muted mt-1">Compliance Score</p>
            </div>
            <div className={cn("px-2 py-1 rounded text-xs font-bold uppercase", config.bg, config.color)}>
                {status.replace('-', ' ')}
            </div>
        </div>

        {issues > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                <span>{issues} issues require attention</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
