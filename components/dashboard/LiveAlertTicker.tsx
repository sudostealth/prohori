import { AlertCircle } from 'lucide-react';

export function LiveAlertTicker() {
  const alerts = [
    "Blocked SQL Injection attempt from 192.168.1.5",
    "Suspicious file modification in /var/www/html",
    "Brute force login attempt blocked (user: admin)"
  ];

  return (
    <div className="w-full bg-surface-2/50 border-y border-border py-2 px-4 overflow-hidden flex items-center">
      <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider shrink-0 mr-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        Live Feed
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {alerts.map((alert, i) => (
            <span key={i} className="mx-8 text-sm text-text-muted">
              <AlertCircle className="inline w-3 h-3 mr-1 text-accent" />
              {alert}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
