import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function SecurityStatusCard({ status = 'secure', blocked = 0, online = 0 }: { status?: 'secure' | 'warning' | 'critical', blocked: number, online: number }) {
  const config = {
    secure: {
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      icon: ShieldCheck,
      label: 'System Secure',
      desc: 'All systems operational'
    },
    warning: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      icon: ShieldAlert,
      label: 'Security Warning',
      desc: 'Potential threats detected'
    },
    critical: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: ShieldX,
      label: 'Critical Alert',
      desc: 'Immediate action required'
    }
  }[status];

  const Icon = config.icon;

  return (
    <Card className={cn("glass-card border-l-4", config.border, status === 'secure' ? 'border-l-green-500' : status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500')}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className={cn("text-2xl font-bold font-display", config.color)}>{config.label}</h2>
            <div className={cn("p-2 rounded-full animate-pulse", config.bg)}>
              <Icon className={cn("w-6 h-6", config.color)} />
            </div>
          </div>
          <p className="text-text-muted">{config.desc}</p>
        </div>

        <div className="flex gap-8 text-right">
          <div>
            <p className="text-3xl font-bold font-display text-white">{blocked}</p>
            <p className="text-sm text-text-muted">Threats Blocked</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-white">{online}</p>
            <p className="text-sm text-text-muted">Agents Online</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
