'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function ServerHealthChart() {
  return (
    <Card className="glass-card h-[300px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Server Health</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-text-muted">
         <Activity className="h-12 w-12 mb-4 opacity-50" />
         <p>Real-time metrics are waiting for agent data.</p>
         <p className="text-xs mt-2">Connect an agent to see CPU & RAM usage.</p>
      </CardContent>
    </Card>
  );
}
