'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'হ্যালো! I am your Prohori AI Security Analyst. How can I assist you with your security alerts today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, history: messages })
      });

      if (!res.ok) throw new Error('Failed to get answer');
      
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I am currently running in mock mode. Please configure the GROQ_API_KEY.'
      }]);
    } catch {
      toast.error('Failed to communicate with AI Analyst');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          AI Security Analyst
        </h1>
        <p className="text-text-muted">Powered by LLaMA-3 to decode complex security threats into plain language.</p>
      </div>

      <Card className="flex-1 glass-card border-none bg-surface/50 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface-2 border border-border' : 'bg-primary/20 border border-primary/50'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-text-muted" /> : <ShieldAlert className="h-4 w-4 text-primary" />}
                </div>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-surface-2 text-white border border-border'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                </div>
                <div className="p-3 rounded-lg bg-surface-2 text-white border border-border flex items-center gap-1">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-surface-2 bg-surface/80">
          <div className="flex gap-2 relative">
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a recent alert or general security advice..."
              className="resize-none bg-surface-2 border-border text-white focus-visible:ring-primary min-h-[60px]"
              rows={2}
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="absolute right-3 bottom-3 h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-background rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
