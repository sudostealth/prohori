"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, ShieldOff, Plus, Command, Terminal, Copy, CheckCircle2, RefreshCw, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

interface Agent {
  id: string;
  agent_name: string;
  agent_id: number;
  status: string;
  ip_address: string;
  os_version: string;
  last_seen: string;
}

export default function EndpointsPage() {
  const [showDeploy, setShowDeploy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, disconnected: 0, pending: 0 });
  const [agentName, setAgentName] = useState("");
  const [osType, setOsType] = useState("linux");
  const [deployScript, setDeployScript] = useState("");
  const [needsConnection, setNeedsConnection] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const supabase = createClient();

  const fetchAgents = async () => {
    setLoading(true);
    setNeedsConnection(false);
    setConnectionError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      const res = await fetch("/api/wazuh/agents", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setStats(data.stats || { total: 0, active: 0, disconnected: 0, pending: 0 });
      } else {
        const data = await res.json();
        if (data.error === "Wazuh not connected") {
          setNeedsConnection(true);
          setConnectionError(data.message || "Please configure your Wazuh connection first");
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeploy = async () => {
    if (!agentName.trim()) {
      toast.error("Please enter a server name");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
      }
      
      const res = await fetch("/api/wazuh/agents", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ agentName, osType }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setDeployScript(data.instructions);
        toast.success("Agent registered! Copy the deployment script below.");
        fetchAgents();
      } else {
        if (data.error === "Wazuh not connected") {
          setNeedsConnection(true);
          setConnectionError(data.message || "Please configure your Wazuh connection first");
        }
        toast.error(data.message || data.error || "Failed to register agent");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register agent");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]">
            <Activity className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "disconnected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold">
            <ShieldOff className="w-3 h-3 mr-1" /> Offline
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold">
            <RefreshCw className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const formatLastSeen = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <Server className="w-8 h-8 text-cyan-400" />
             Endpoint Agents
           </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium">Manage and deploy Wazuh security agents across your infrastructure.</p>
        </div>
        
        {!needsConnection && (
          <div className="flex gap-2">
            <Button onClick={fetchAgents} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={() => { setShowDeploy(true); setDeployScript(""); setAgentName(""); }} className="bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Deploy New Agent
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-cyan-500/5 border-cyan-500/20 p-5 flex gap-4">
            <Activity className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-cyan-300 mb-1">What are Endpoint Agents?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Endpoint agents are lightweight services installed on your servers. They continuously monitor system activity, analyzing logs, detecting file integrity changes, and assessing configuration weaknesses.
              </p>
            </div>
          </Card>
          <Card className="bg-purple-500/5 border-purple-500/20 p-5 flex gap-4">
            <ShieldOff className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-purple-300 mb-1">Why deploy them?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Deploying agents allows Prohori to catch real-time threats like rootkits, brute-force attacks, and malware. Without an agent, your server remains invisible to the security dashboard.
              </p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Needs Connection Warning */}
      {needsConnection && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-yellow-500/10 border-yellow-500/20 p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Wazuh Not Connected</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                {connectionError || "Please configure your Wazuh connection in settings to start monitoring your servers."}
              </p>
              <div className="flex gap-3">
                <Button onClick={fetchAgents} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/dashboard/settings/wazuh" className="inline-flex items-center justify-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold rounded-md">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Configure Wazuh
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      {!needsConnection && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Assets", val: stats.total, color: "text-white" },
            { label: "Active Agents", val: stats.active, color: "text-green-400" },
            { label: "Offline", val: stats.disconnected, color: "text-red-400" },
          ].map((stat, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
               <Card className="bg-navy-900/40 border-white/10 p-6">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                 <h3 className={`text-4xl font-extrabold mt-2 ${stat.color}`}>{stat.val}</h3>
               </Card>
             </motion.div>
          ))}
        </div>
      )}

      {/* Endpoints Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="bg-navy-900/60 border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Server className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-semibold">No agents deployed yet</p>
                <p className="text-sm mt-1">Click &quot;Deploy New Agent&quot; to get started</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Agent Name</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">OS</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agents.map((ep, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {ep.agent_name}
                      </td>
                      <td className="p-4 text-sm text-gray-300 font-mono">{ep.ip_address || "—"}</td>
                      <td className="p-4 text-sm text-gray-400 flex items-center gap-2">
                         {ep.os_version?.toLowerCase().includes("windows") ? <Command className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                         {ep.os_version || "Linux"}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(ep.status)}
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-medium text-right">{formatLastSeen(ep.last_seen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Deploy Modal */}
      <AnimatePresence>
        {showDeploy && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowDeploy(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border-b border-white/5 shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Add New Agent</h3>
                  <p className="text-sm text-gray-400 font-medium">Configure your agent before deployment</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDeploy(false)} className="rounded-full hover:bg-white/10 shrink-0">
                  <Command className="w-5 h-5 text-gray-400" />
                </Button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto">
                {!deployScript ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Server Name</Label>
                      <Input 
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g., web-server-01, db-prod"
                        className="mt-2 bg-black/30 border-white/10 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">This will be shown in your dashboard</p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Operating System</Label>
                      <Select value={osType} onValueChange={(val) => val && setOsType(val)}>
                        <SelectTrigger className="mt-2 bg-black/30 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-800 border-white/10">
                          <SelectItem value="linux" className="text-gray-300">Linux (Ubuntu, Debian, CentOS, etc.)</SelectItem>
                          <SelectItem value="windows" className="text-gray-300">Windows Server</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button onClick={() => setShowDeploy(false)} variant="outline" className="flex-1 py-6 bg-transparent border-white/10 hover:bg-white/5 font-bold text-gray-300">
                        Cancel
                      </Button>
                      <Button onClick={handleDeploy} disabled={submitting} className="flex-1 py-6 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {submitting ? "Generating..." : "Generate Script"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        Agent registered successfully!
                      </div>
                      <p className="text-sm text-green-400/70 mt-1">Copy and run the installation script below on your server.</p>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute top-0 right-0 p-3">
                        <Button size="sm" variant="secondary" onClick={() => {
                          navigator.clipboard.writeText(deployScript);
                          setCopied(true);
                          toast.success("Script copied!");
                          setTimeout(() => setCopied(false), 2000);
                        }} className="h-8 bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/5">
                          {copied ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
                          {copied ? "Copied" : "Copy Code"}
                        </Button>
                      </div>
                      <pre className="p-6 pt-12 bg-black/50 border border-white/5 rounded-xl overflow-x-auto">
                        <code className="text-sm text-gray-300 font-mono leading-relaxed">
                          {deployScript.split('\n').map((line, i) => (
                            <div key={i} className="whitespace-pre">
                              <span className="text-gray-600 mr-4 select-none mr-2 border-r border-white/10 pr-2 inline-block w-8 text-right">{i+1}</span>
                              <span className={line.startsWith('sudo') ? 'text-purple-400' : line.startsWith('WAZUH') || line.startsWith('Invoke') ? 'text-cyan-400' : 'text-gray-300'}>{line}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => { setShowDeploy(false); fetchAgents(); }} variant="outline" className="flex-1 py-6 bg-transparent border-white/10 hover:bg-white/5 font-bold text-gray-300">
                        Done
                      </Button>
                      <Button onClick={fetchAgents} className="flex-1 py-6 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                        <RefreshCw className="w-4 h-4 mr-2" /> Check Connection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
