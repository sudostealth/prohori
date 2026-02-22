'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ShieldAlert, Sparkles, Bot } from 'lucide-react';
import { ChatBubble } from '@/components/ai-analyst/ChatBubble';
import { cn } from '@/lib/utils';

// Mock alerts
const alerts = [
  { id: '1', title: 'SSH Brute Force', severity: 'critical', time: '10m ago', description: 'Multiple failed login attempts from IP 45.33.22.11' },
  { id: '2', title: 'Suspicious File Upload', severity: 'high', time: '1h ago', description: 'File with double extension .php.jpg uploaded' },
  { id: '3', title: 'Port Scan Detected', severity: 'medium', time: '3h ago', description: 'Port 80, 443, 8080 scanned from 192.168.1.100' },
];

export default function AIAnalystPage() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAlertSelect = (id: string) => {
    setSelectedAlert(id);
    const alert = alerts.find(a => a.id === id);
    // Reset chat or load history for this alert
    setMessages([
      { role: 'ai', content: `I see you're looking at alert **#${id}**: ${alert?.title}. How can I help you analyze this threat?` }
    ]);
  };

  const handleAskAI = async () => {
    if (!selectedAlert) return;
    const alert = alerts.find(a => a.id === selectedAlert);
    if (!alert) return;

    setLoading(true);

    // Simulate API call

    // If it's the first interaction (button click), simulate standard analysis
    if (messages.length === 1) {
        const userMessage = { role: 'user' as const, content: "Analyze this alert and tell me what to do." };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
          const aiResponse = {
            role: 'ai' as const,
            content: `**Analysis of ${alert.title}**\n\nThis alert indicates that an external IP address is attempting to guess passwords for your SSH service. This is a common attack vector.\n\n**Severity:** ${alert.severity.toUpperCase()}\n\n**Recommended Actions:**\n1. Block the IP address \`45.33.22.11\` in your firewall.\n2. Disable password authentication for SSH and use keys instead.\n3. Change the default SSH port from 22 to something else.`
          };
          setMessages(prev => [...prev, aiResponse]);
          setLoading(false);
        }, 1500);
    } else {
        // Chat interaction
        const userMessage = { role: 'user' as const, content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        setTimeout(() => {
            const aiResponse = {
                role: 'ai' as const,
                content: "That's a good question. Normally, you would check `/var/log/auth.log` on your Linux server to see the full list of attempts. Would you like the command to do that?"
            };
            setMessages(prev => [...prev, aiResponse]);
            setLoading(false);
        }, 1000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;
      handleAskAI();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Left Pane: Alerts List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
        <h2 className="text-xl font-display font-bold text-white mb-2">Security Alerts</h2>
        <ScrollArea className="flex-1 pr-4 border rounded-lg bg-surface-2/20">
          <div className="space-y-3 p-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertSelect(alert.id)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                  selectedAlert === alert.id
                    ? "bg-primary/10 border-primary"
                    : "bg-surface-2 border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase",
                      alert.severity === 'critical' ? "bg-red-500/20 text-red-500" :
                      alert.severity === 'high' ? "bg-orange-500/20 text-orange-500" :
                      "bg-blue-500/20 text-blue-500"
                   )}>
                     {alert.severity}
                   </div>
                   <span className="text-xs text-text-muted">{alert.time}</span>
                </div>
                <h3 className="font-bold text-white mb-1">{alert.title}</h3>
                <p className="text-xs text-text-muted line-clamp-2">{alert.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Chat Interface */}
      <div className="flex-1 flex flex-col bg-surface-2/30 rounded-xl border border-border overflow-hidden h-full">
        {selectedAlert ? (
          <>
            <div className="p-4 border-b border-border bg-surface-2/50 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 <span className="font-bold text-white">AI Security Analyst</span>
               </div>
               <div className="text-xs text-text-muted hidden sm:block">Llama 3.3 70B via Groq</div>
            </div>

            <ScrollArea className="flex-1 p-4">
               {messages.map((msg, i) => (
                 <ChatBubble key={i} role={msg.role} content={msg.content} />
               ))}
               {loading && (
                 <div className="flex gap-4 mb-6 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center shrink-0">
                       <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-surface-2 h-12 w-24 rounded-2xl rounded-tl-none"></div>
                 </div>
               )}
            </ScrollArea>

            <div className="p-4 border-t border-border bg-surface-2/50 shrink-0">
               {messages.length <= 1 ? (
                 <Button onClick={handleAskAI} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-background">
                   <Sparkles className="mr-2 h-4 w-4" />
                   Analyze this alert
                 </Button>
               ) : (
                 <form className="flex gap-2" onSubmit={handleSendMessage}>
                    <Input
                        placeholder="Ask follow-up questions..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-surface border-border text-white focus-visible:ring-primary flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-primary text-background" disabled={loading || !inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                 </form>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center">
            <div className="h-16 w-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Select an alert to analyze</h3>
            <p className="max-w-md">Prohori AI can explain complex security logs, assess severity, and guide you through remediation steps in plain English or Bangla.</p>
          </div>
        )}
      </div>
    </div>
  );
}
