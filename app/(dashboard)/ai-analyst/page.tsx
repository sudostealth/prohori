'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ShieldAlert, Bot, AlertTriangle, AlertCircle } from 'lucide-react';
import { ChatBubble } from '@/components/ai-analyst/ChatBubble';
import { cn } from '@/lib/utils';
import { getRecentAlerts } from '@/app/actions/dashboard';
import { Alert } from '@/lib/types';
import { toast } from 'react-hot-toast';

export default function AIAnalystPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    async function loadAlerts() {
      // Cast the fetched unauthenticated proxy response to Alert type list if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await getRecentAlerts(15) as any[];
      setAlerts(data || []);
    }
    loadAlerts();
  }, []);

  const handleAlertSelect = (id: string) => {
    setSelectedAlert(id);
    const alert = alerts.find(a => a.id === id);
    setMessages([
      { role: 'ai', content: `I see you're looking at alert: **${alert?.title}**. How can I help you analyze this threat? Click the button below to get an initial analysis, or ask a specific question.` }
    ]);
  };

  const handleAskAI = async (e?: React.FormEvent, initialQuery?: string) => {
    if (e) e.preventDefault();
    if (!selectedAlert) return;
    const alert = alerts.find(a => a.id === selectedAlert);
    if (!alert) return;

    let userMessageContent = initialQuery || inputValue;
    if (!userMessageContent) {
        userMessageContent = "Analyze this alert and tell me what to do.";
    }

    setLoading(true);

    const userMessage = { role: 'user' as const, content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
        const systemPromptAddon = `\n\nContext for current alert:\nTitle: ${alert.title}\nSeverity: ${alert.severity}\nIP: ${alert.source_ip || 'N/A'}\nDescription: ${alert.description}\nTimestamp: ${alert.created_at}`;

        const res = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessageContent + systemPromptAddon,
                history: messages.slice(1) // skip the first local intro message
            })
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
            toast.error(data.error);
        } else {
             setMessages(prev => [...prev, { role: 'ai' as const, content: data.reply }]);
        }

    } catch (err) {
        console.error("AI Error:", err);
        toast.error("Failed to communicate with AI.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      <div className="w-80 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Recent Threats</h2>
          <p className="text-sm text-text-muted">Select an alert to analyze with AI</p>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3 pb-4">
            {alerts.length === 0 ? (
                <div className="text-sm text-text-muted italic">No recent alerts found.</div>
            ) : (
                alerts.map((alert) => (
                <div
                    key={alert.id}
                    onClick={() => handleAlertSelect(alert.id)}
                    className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all border",
                    selectedAlert === alert.id
                        ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(23,163,74,0.1)]"
                        : "bg-surface-2 border-border hover:border-text-muted hover:bg-surface-2/80"
                    )}
                >
                    <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {alert.severity === 'critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        {alert.severity === 'high' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        {alert.severity !== 'critical' && alert.severity !== 'high' && <ShieldAlert className="w-4 h-4 text-yellow-500" />}
                        <span className="font-semibold text-white text-sm truncate max-w-[150px]">{alert.title}</span>
                    </div>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{alert.description}</p>
                </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden border-border">
        <div className="h-16 border-b border-border bg-surface-2/50 flex items-center px-6">
          <Bot className="w-5 h-5 text-primary mr-3" />
          <h3 className="font-display font-semibold text-white">Security Analyst AI</h3>
        </div>

        <div className="flex-1 bg-surface-2/10 relative">
          {!selectedAlert ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
               <Bot className="w-16 h-16 mb-4 opacity-20" />
               <p>Select a threat from the sidebar to begin analysis</p>
            </div>
          ) : (
             <ScrollArea className="h-full p-6">
               <div className="max-w-3xl mx-auto space-y-6 pb-6">
                 {messages.map((msg, i) => (
                   <ChatBubble key={i} role={msg.role} content={msg.content} />
                 ))}

                 {loading && (
                    <div className="flex justify-start">
                      <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-6 py-4 flex gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                         <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
                         <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                 )}

                 {messages.length === 1 && !loading && (
                    <div className="flex justify-start mt-4">
                       <Button
                         variant="outline"
                         className="border-primary/30 hover:bg-primary/10 text-primary"
                         onClick={(e) => handleAskAI(e, 'Analyze this alert and tell me what to do.')}
                       >
                         <ShieldAlert className="w-4 h-4 mr-2" />
                         Run Full Analysis
                       </Button>
                    </div>
                 )}
               </div>
             </ScrollArea>
          )}
        </div>

        <div className="p-4 bg-surface-2/50 border-t border-border">
          <form
            className="max-w-3xl mx-auto flex gap-2"
            onSubmit={(e) => handleAskAI(e)}
          >
             <Input
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder={selectedAlert ? "Ask a specific question about this threat..." : "Select an alert first..."}
               disabled={!selectedAlert || loading}
               className="bg-surface border-border focus-visible:ring-primary"
             />
             <Button
               type="submit"
               disabled={!selectedAlert || !inputValue.trim() || loading}
               className="bg-primary hover:bg-primary/90 text-background"
             >
                <Send className="w-4 h-4" />
             </Button>
          </form>
          <div className="text-center mt-2">
               <div className="text-xs text-text-muted">Llama 3.3 70B via Groq</div>
          </div>
        </div>
      </div>
    </div>
  );
}
