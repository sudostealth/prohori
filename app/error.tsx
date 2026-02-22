'use client';

import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-display font-bold text-white">Security Console Error</h2>
      <p className="text-text-muted max-w-md">
        A system anomaly was detected while rendering this view. Our edge systems have logged the incident.
      </p>
      <div className="flex gap-4 mt-6">
        <Button onClick={() => reset()} className="bg-primary hover:bg-primary/90 text-background">
          Retry Component
        </Button>
        <Button variant="outline" className="border-[#333] text-white hover:bg-[#222]" onClick={() => window.location.reload()}>
          Full Refresh
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-black border border-red-500/30 text-red-400 text-left text-xs max-w-2xl w-full overflow-auto rounded-lg">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      )}
    </div>
  );
}
