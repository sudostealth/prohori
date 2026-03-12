"use client";
import { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2, Globe, ChevronDown, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  "What is an SSH brute force attack and how do I stop it?",
  "বাংলায় বলুন: আমার সার্ভারের নিরাপত্তা কেমন?",
  "Explain the recent critical alert in simple terms",
  "What steps should I take to prevent ransomware?",
];

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "আসসালামু আলাইকুম! I'm your AI Security Analyst. I can help you understand security alerts, explain threats in plain language, and provide actionable recommendations — in English or বাংলা. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [langOpen, setLangOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/explain-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content, language }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: "err", role: "assistant", content: "⚠️ Connection error. Please check your settings and try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Security Analyst</h1>
            <p className="text-xs text-gray-500">Powered by Groq LLaMA3 — Instant threat intelligence</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm text-gray-300 hover:border-white/15 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            {language === "en" ? "English" : "বাংলা"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 glass-card py-1 w-32 z-10">
              {[{ value: "en", label: "English" }, { value: "bn", label: "বাংলা" }].map((l) => (
                <button
                  key={l.value}
                  onClick={() => { setLanguage(l.value as "en" | "bn"); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${language === l.value ? "text-cyan-400 bg-cyan-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sample prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
          {SAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="glass-card-hover p-3 text-left text-xs text-gray-400 hover:text-gray-200"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mb-1.5" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/30 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <Brain className="w-4 h-4 text-purple-400 drop-shadow-[0_0_5px_currentColor]" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/20 text-white rounded-tr-sm shadow-cyan-500/5"
                    : "bg-navy-800/80 border border-white/5 backdrop-blur-md text-gray-200 rounded-tl-sm shadow-white/5"
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-2 font-medium ${msg.role === "user" ? "text-cyan-200/60" : "text-gray-500"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Brain className="w-4 h-4 text-purple-400 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <div className="bg-navy-800/80 border border-white/5 backdrop-blur-md rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i} 
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 glass-card p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none max-h-32"
          placeholder={language === "en" ? "Ask about a security alert, threat, or best practice..." : "নিরাপত্তা সম্পর্কে প্রশ্ন করুন..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-glow"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
        </button>
      </div>
    </div>
  );
}
