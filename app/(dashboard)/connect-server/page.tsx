'use client';

import { useState, useEffect } from 'react';
import { getAgentInstallCommand, checkAgentStatus } from '@/app/actions/agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Loader2, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ConnectServerPage() {
  const [command, setCommand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadCommand() {
      try {
        const cmd = await getAgentInstallCommand();
        setCommand(cmd);

        // Initial check
        const agent = await checkAgentStatus();
        if (agent) {
           setStatus(agent.status);
           if (agent.status === 'connected') {
               toast.success('Agent already connected!');
               router.push('/dashboard');
           }
        }
      } catch (error) {
        console.error('Failed to load command:', error);
        toast.error('Failed to load installation instructions.');
      } finally {
        setLoading(false);
      }
    }
    loadCommand();

    // Poll for status every 10 seconds
    const interval = setInterval(async () => {
        const agent = await checkAgentStatus();
        if (agent) {
            setStatus(agent.status);
            if (agent.status === 'connected') {
                toast.success('Connection successful! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 2000);
            }
        }
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const copyCommand = () => {
    if (command) {
        navigator.clipboard.writeText(command);
        toast.success('Command copied to clipboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Connect Your Server</h1>
        <p className="text-text-muted mt-2">Install the Prohori Agent to start monitoring your infrastructure.</p>
      </div>

      <Card className="glass-card border-none bg-surface/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Installation Command
          </CardTitle>
          <CardDescription className="text-text-muted">
            Run this command on your Linux server (Ubuntu/Debian recommended).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
             <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400 border border-white/10 relative group">
                <div className="break-all pr-10">
                    {command}
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-text-muted hover:text-white"
                    onClick={copyCommand}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          )}

          <div className="space-y-4">
             <h3 className="text-white font-medium">Steps:</h3>
             <ol className="list-decimal list-inside text-text-muted space-y-2 text-sm">
                 <li>Log in to your server via SSH.</li>
                 <li>Paste the command above and press Enter.</li>
                 <li>Wait for the installation to complete (approx. 2 minutes).</li>
                 <li>The dashboard will automatically update when connected.</li>
             </ol>
          </div>

          <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Connection Status:</span>
                  <div className="flex items-center gap-2">
                      {status === 'connected' ? (
                          <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
                              <CheckCircle2 className="h-4 w-4" /> Connected
                          </span>
                      ) : (
                          <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for connection...
                          </span>
                      )}
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
