"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Activity, AlertTriangle, RefreshCw, Copy, 
  XCircle, MessageSquare, Terminal, HelpCircle,
  Shield, CheckCircle2, Search, Zap, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
  provider?: string;
}

const QUICK_ACTIONS = [
  { label: "Explain latest critical alert", icon: AlertTriangle, prompt: "Explain the latest critical security alert in simple terms." },
  { label: "Summarize server health", icon: Activity, prompt: "Provide a summary of current server health and performance metrics." },
  { label: "Security recommendations", icon: Shield, prompt: "What are the top 3 security improvements I should make right now?" },
  { label: "Check compliance", icon: CheckCircle2, prompt: "Am I compliant with basic security standards? What should I improve?" },
  { label: "Threat hunting tips", icon: Search, prompt: "Give me tips for proactive threat hunting in my environment." },
  { label: "Explain attack pattern", icon: Zap, prompt: "Explain common attack patterns and how to defend against them." }
];

export default function AIAnalystChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [temperature, setTemperature] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);
    
    try {
      // First fetch server data
      let currentServerData = {};
      try {
        const serverDataRes = await fetch("/api/ai-server", {
          method: "GET",
          headers: {
            // Need authorization headers in actual implementation but handled via auth cookies natively
          }
        });
        if (serverDataRes.ok) {
          const resJson = await serverDataRes.json();
          currentServerData = resJson.serverData || {};
        }
      } catch (err) {
        console.warn("Failed to fetch server data for AI context:", err);
      }

      const response = await fetch("/api/ai-server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
          language: language,
          serverData: currentServerData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "a",
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
        usage: data.usage,
        model: data.model,
        provider: data.provider
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI chat error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyLastResponse = (e: React.MouseEvent) => {
    const lastAIMessage = messages.slice().reverse().find(m => !m.isUser);
    if (lastAIMessage) {
      navigator.clipboard.writeText(lastAIMessage.content);
      // Show temporary success feedback
      const originalText = e.currentTarget.innerHTML;
      e.currentTarget.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-check' viewBox='0 0 16 16'><path d='M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z'/></svg> Copied!";
      setTimeout(() => {
        e.currentTarget.innerHTML = originalText;
      }, 2000);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_currentColor]" />
          <div>
            <h3 className="text-base font-semibold text-white mt-0">AI Security Analyst</h3>
            <p className="text-xs text-gray-400">Powered by multiple AI models</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleLanguage}
            title="Toggle language"
            className="hover:bg-white/5"
          >
            {language === "en" ? (
              <Activity className="w-4 h-4" />
            ) : (
              <>
                <Activity className="w-4 h-4" />
                {'বাংলা'}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            className="hover:bg-white/5"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={clearChat}
            title="Clear Chat"
            className="hover:bg-white/5 text-destructive"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pb-8">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col max-w-[80%]">
              {message.isUser && (
                <div className="self-end">
                  <div className="bg-cyan-500/20 text-cyan-400 rounded-lg px-3 py-2 max-w-xs">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="xs text-xs text-cyan-400/50 block">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              )}
              
              {!message.isUser && (
                <div className="self-start">
                  <div className="bg-white/5 rounded-lg px-3 py-2 max-w-xs border border-white/10">
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 mt-0.5 text-green-400" />
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.usage && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Tokens: {message.usage.totalTokens?.toLocaleString() || 'N/A'}
                            </span>
                            {message.model && message.provider && (
                              <span className="flex items-center gap-1">
                                <Terminal className="w-3 h-3" />
                                {message.provider.toUpperCase()}: {message.model.split('/').pop()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={copyLastResponse}
                            className="p-1 hover:bg-white/5"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </Button>
                          <span className="text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 animate-ping text-cyan-400" />
                <span className="text-gray-400">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about security alerts, server health, or get recommendations..."
            className="flex-1 min-h-[60px] resize-none bg-black/30 text-white/90 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500/20 focus:border-transparent outline-none text-sm"
            rows={2}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        {!isLoading && messages.length === 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Quick Actions:</h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(action.prompt);
                    sendMessage();
                  }}
                  className="text-xs px-3 py-1.5 border-white/10 hover:bg-white/5"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-3">AI Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Temperature</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-400 w-8 text-center">{temperature.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={true} 
                    onChange={() => {}} 
                  />
                  Enable fallback providers
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => {}} 
                  />
                  Stream responses
                </label>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(false)}
              className="w-full text-xs text-gray-400 hover:text-white"
            >
              Close Settings
            </Button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}