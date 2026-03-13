"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Loader2, Trash2, Save, RefreshCw, AlertTriangle, Eye, EyeOff, Terminal, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface WazuhConnection {
  id: string;
  name: string;
  api_url: string;
  api_username: string;
  connection_status: string;
  last_connected: string;
  last_error: string | null;
}

export default function WazuhSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<WazuhConnection | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    api_url: "",
    api_username: "",
    api_password: "",
  });

  const supabase = createClient();

  const fetchConnection = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
      }
      
      const res = await fetch("/api/wazuh/connection", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      const data = await res.json();
      
      if (data.connected && data.connection) {
        setIsConnected(true);
        setConnection(data.connection);
        setFormData({
          name: data.connection.name || "",
          api_url: data.connection.api_url || "",
          api_username: data.connection.api_username || "",
          api_password: "",
        });
      } else {
        setIsConnected(false);
        setConnection(null);
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
      toast.error("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveConnection = async () => {
    if (!formData.api_url || !formData.api_username || !formData.api_password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
      }
      
      const res = await fetch("/api/wazuh/connection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Connection saved successfully!");
        fetchConnection();
      } else {
        toast.error(data.error || "Failed to save connection");
      }
    } catch {
      toast.error("Failed to save connection");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.api_url || !formData.api_username || !formData.api_password) {
      toast.error("Please fill in all fields to test connection");
      return;
    }

    setTesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
      }
      
      const res = await fetch("/api/wazuh/connection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ ...formData, _testOnly: true }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Connection successful!");
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this Wazuh connection?")) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
      }
      
      const res = await fetch("/api/wazuh/connection", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (res.ok) {
        toast.success("Connection removed");
        setIsConnected(false);
        setConnection(null);
        setFormData({ name: "", api_url: "", api_username: "", api_password: "" });
      } else {
        toast.error("Failed to remove connection");
      }
    } catch {
      toast.error("Failed to remove connection");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-400" />
            Wazuh Connection
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure your Wazuh SIEM integration</p>
        </div>
        <Button 
          onClick={fetchConnection} 
          variant="outline" 
          size="sm"
          className="bg-white/5 border-white/10 hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Connection Status Card */}
      {isConnected && connection && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-green-500/10 border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Connected
                  </h3>
                  <p className="text-sm text-green-400/70">
                    {connection.name} • {connection.api_url}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last connected: {formatDate(connection.last_connected)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Connection Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-navy-900/40 border-white/10 p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            {isConnected ? "Update Connection" : "Configure Connection"}
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Connection Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Wazuh Server"
                className="mt-1.5 bg-black/30 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">A friendly name for this connection</p>
            </div>

            <div>
              <Label className="text-gray-300">API URL <span className="text-red-400">*</span></Label>
              <Input
                value={formData.api_url}
                onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                placeholder="https://wazuh.example.com:55000"
                className="mt-1.5 bg-black/30 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">API Username <span className="text-red-400">*</span></Label>
              <Input
                value={formData.api_username}
                onChange={(e) => setFormData({ ...formData, api_username: e.target.value })}
                placeholder="wazuh-wui"
                className="mt-1.5 bg-black/30 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">API Password <span className="text-red-400">*</span></Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.api_password}
                  onChange={(e) => setFormData({ ...formData, api_password: e.target.value })}
                  placeholder={isConnected ? "Leave blank to keep current password" : "Enter API password"}
                  className="pr-11 bg-black/30 border-white/10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {connection?.last_error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Last Error</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{connection.last_error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {isConnected && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Connection
                </Button>
              )}
              
              <div className="flex-1" />
              
              <Button
                onClick={handleTestConnection}
                disabled={testing || !formData.api_url || !formData.api_username || !formData.api_password}
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Test Connection
              </Button>
              
              <Button
                onClick={handleSaveConnection}
                disabled={saving || !formData.api_url || !formData.api_username || !formData.api_password}
                className="bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : isConnected ? "Update Connection" : "Save Connection"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Help Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-6">
          <h3 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            How to find your Wazuh API credentials
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
              <p>Log in to your <strong>Wazuh dashboard</strong> using an administrator account.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
              <p>In the top menu, go to <strong>Settings</strong> (gear icon), then click on <strong>API</strong>.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
              <p>Click on the <strong>Add new API</strong> button or select an existing one.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">4</div>
              <p>Note down the <strong>API URL</strong>. It usually looks like <code>https://your-server-ip:55000</code>. Make sure to include the port if your setup uses one.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">5</div>
              <p>Enter the <strong>API Username</strong> and <strong>API Password</strong> associated with this connection.</p>
            </div>
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/5 text-xs text-gray-400 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
              <p>Important: Ensure your Prohori portal can reach the Wazuh API URL over the network (e.g., port 55000 is open in your firewall rules).</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
