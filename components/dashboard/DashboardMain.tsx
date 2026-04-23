"use client";
import { useState } from "react";
import { 
  Activity, AlertTriangle, Server, Download, RefreshCw,
  Cpu, CheckCircle2, XCircle, AlertCircle,
  Check, Terminal, ChevronDown, ChevronUp
} from "lucide-react";
import type { SecurityAlert, ServerMetric } from "@/types";

interface DashboardMainProps {
  company: Record<string, unknown> | null;
  alerts: SecurityAlert[];
  metrics: ServerMetric[];
  activeSub: Record<string, unknown> | null;
  serverConnected: boolean;
  hasUploadedLogs: boolean;
}

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500", label: "CRITICAL" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500", label: "HIGH" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-500", label: "MEDIUM" },
  low:      { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", dot: "bg-green-500", label: "LOW" },
  info:     { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500", label: "INFO" },
};

import Link from "next/link";

const CONNECTION_STEPS = [
  {
    title: "Step 1: Get Wazuh Credentials",
    description: "First, you need the API credentials from your Wazuh server to allow Prohori to connect.",
    instructions: [
      "1. Log in to your Wazuh web interface.",
      "2. Navigate to Settings (the gear icon) > API.",
      "3. Click 'Add new API' or view an existing one.",
      "4. Note down the API URL (usually https://your-server:55000).",
      "5. Note down the API Username and Password.",
    ],
    actionText: "Got my credentials",
  },
  {
    title: "Step 2: Connect via Settings",
    description: "Now enter these credentials into your Prohori portal.",
    instructions: [
      "1. Click the button below to go to Settings > Wazuh Connection.",
      "2. Enter a name for your connection (e.g., 'Main Server').",
      "3. Paste your API URL, Username, and Password.",
      "4. Click 'Save Connection' and ensure it shows 'Connected'.",
    ],
    actionLink: "/dashboard/settings/wazuh",
    actionText: "Go to Settings",
  },
  {
    title: "Step 3: Deploy Endpoint Agents",
    description: "Once connected, you can deploy agents to monitor your servers.",
    instructions: [
      "1. Navigate to 'Endpoints' from the left sidebar.",
      "2. Click 'Deploy New Agent'.",
      "3. Enter a name for the server and select its OS.",
      "4. Copy the generated script and run it on your server's terminal.",
    ],
    actionLink: "/dashboard/endpoints",
    actionText: "Go to Endpoints",
  },
];

function GaugeCircle({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - value / 100);
  const textColor = value > 85 ? "text-red-400" : value > 70 ? "text-orange-400" : "text-green-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${textColor}`}>{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function OnboardingPanel({ serverConnected, agentsDeployed }: { serverConnected: boolean; agentsDeployed: boolean }) {
  const [mode, setMode] = useState<"choose" | "wazuh" | "upload">("choose");
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(serverConnected && !agentsDeployed ? 2 : 0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/logs/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="glass-card p-8 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Prohori</h2>
          <p className="text-gray-400 text-sm mt-2">Choose how you want to connect your data to get started.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <button onClick={() => setMode("wazuh")} className="glass-card-hover p-6 text-left group border border-white/5 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,212,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect Wazuh Server</h3>
            <p className="text-sm text-gray-400">Connect to your existing Wazuh manager to stream live alerts and metrics.</p>
          </button>

          <button onClick={() => setMode("upload")} className="glass-card-hover p-6 text-left group border border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
              <Download className="w-6 h-6 text-white rotate-180" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Log File</h3>
            <p className="text-sm text-gray-400">Upload a single log, CSV, or Excel file to analyze offline with our AI Analyst.</p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "upload") {
    return (
      <div className="glass-card p-8 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] mx-auto mb-6">
          <Download className="w-8 h-8 text-white rotate-180" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Upload Your Log File</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">Select a .log, .csv, or .xls file from your computer. Our AI will analyze it to help you identify threats.</p>

        <label className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? (
            <>Uploading... <RefreshCw className="w-4 h-4 animate-spin" /></>
          ) : (
            <>Select File <Download className="w-4 h-4 rotate-180" /></>
          )}
          <input type="file" className="hidden" accept=".log,.csv,.xls,.xlsx,.txt" onChange={handleUpload} disabled={uploading} />
        </label>

        <div className="mt-8">
          <button onClick={() => setMode("choose")} className="text-sm text-gray-400 hover:text-white transition-colors">← Back to options</button>
        </div>
      </div>
    );
  }

  // Wazuh Mode
  return (
    <div className="glass-card p-8 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setMode("choose")} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mr-2">
             <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] shrink-0">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Connect Your Server</h2>
            <p className="text-gray-400 text-sm mt-1">Connect your Wazuh server to Prohori to start monitoring your infrastructure.</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-md ${i <= activeStep ? "bg-cyan-500 text-navy-900 shadow-cyan-500/30" : "bg-white/5 text-gray-500 border border-white/10"}`}>
              {i < activeStep ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            {i < 2 && <div className={`h-1 rounded-full flex-1 transition-all ${i < activeStep ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.3)]" : "bg-white/5"}`} />}
          </div>
        ))}
      </div>

      {/* Steps Content */}
      <div className="space-y-4 mb-8">
        {CONNECTION_STEPS.map((step, i) => (
          <div key={step.title} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${i === activeStep ? "border-cyan-500/40 bg-navy-900/80 shadow-[0_0_20px_rgba(0,212,255,0.05)]" : "border-white/5 bg-black/20 opacity-70 hover:opacity-100 hover:border-white/20"}`}>
            <button
              onClick={() => setActiveStep(i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === activeStep ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-gray-500"}`}>
                  <span className="font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-base ${i === activeStep ? "text-white" : "text-gray-400"}`}>
                    {step.title}
                  </h3>
                  {i !== activeStep && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] sm:max-w-md">{step.description}</p>}
                </div>
              </div>
              {i === activeStep ? (
                <ChevronUp className="w-5 h-5 text-cyan-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {i === activeStep && (
              <div className="px-5 pb-6 pt-2 pl-[4.5rem]">
                <p className="text-sm text-gray-300 mb-4">{step.description}</p>

                <div className="bg-black/40 rounded-xl p-5 border border-white/5 mb-5 space-y-3">
                  {step.instructions.map((inst, j) => (
                    <div key={j} className="text-sm text-gray-300 flex items-start gap-2">
                       <span className="text-cyan-400 mt-0.5">•</span>
                       <span>{inst.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>

                {step.actionLink ? (
                  <Link href={step.actionLink} className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold px-6 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    {step.actionText}
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveStep(prev => Math.min(prev + 1, 2))}
                    className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold px-6 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                  >
                    {step.actionText}
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-300 mb-1">Why connect Wazuh?</p>
            <p className="text-xs text-blue-400/80 leading-relaxed">
              Prohori connects to your existing Wazuh manager to fetch alerts, metrics, and manage agents directly from this portal. You maintain full ownership of your data.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Terminal className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-purple-300 mb-1">Need help?</p>
            <p className="text-xs text-purple-400/80 leading-relaxed">
              Ensure ports 1514 and 1515 are open on your Wazuh manager. If you need assistance, use our AI Analyst to ask questions about configuration and troubleshooting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardMain({
  company,
  alerts,
  metrics,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activeSub,
  serverConnected,
  hasUploadedLogs,
}: DashboardMainProps) {
  const [downloading, setDownloading] = useState(false);

  const agentsDeployed = metrics.length > 0;

  const avgCpu = metrics.length ? metrics.reduce((s, m) => s + m.cpu_percent, 0) / metrics.length : 0;
  const avgMem = metrics.length ? metrics.reduce((s, m) => s + m.memory_percent, 0) / metrics.length : 0;
  const avgDisk = metrics.length ? metrics.reduce((s, m) => s + m.disk_percent, 0) / metrics.length : 0;

  const onlineServers = metrics.filter((m) => m.status === "online").length;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && a.status === "open").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/download-report");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prohori-report-${new Date().toISOString().split("T")[0]}.pdf`;
        a.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {company?.name as string} &mdash; Real-time threat monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex-1 sm:flex-none justify-center py-2 px-4 text-sm flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary flex-1 sm:flex-none justify-center py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Generating..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Show full onboarding if not connected or no agents are deployed AND no logs are uploaded */}
      {(!serverConnected || !agentsDeployed) && !hasUploadedLogs ? (
        <OnboardingPanel serverConnected={serverConnected} agentsDeployed={agentsDeployed} />
      ) : (
        <div className="flex flex-col gap-4">
          {serverConnected && agentsDeployed && (
            <div className="glass-card p-4 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Wazuh Server Connected</p>
                  <p className="text-xs text-green-400">Monitoring {metrics.length} agents actively</p>
                </div>
              </div>
              <Link href="/dashboard/settings/wazuh" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2">
                <Server className="w-3.5 h-3.5" /> Configure
              </Link>
            </div>
          )}
          {hasUploadedLogs && (
            <div className="glass-card p-4 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-400 rotate-180" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Log File Uploaded</p>
                  <p className="text-xs text-purple-400">Ready for AI Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/ai-analyst" className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2">
                  Analyze Log
                </Link>
                <Link href="/dashboard/settings/logs" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2">
                  Manage
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Online Servers", value: serverConnected ? onlineServers : "—", icon: Server, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Open Alerts", value: serverConnected ? openAlerts : "—", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Critical", value: serverConnected ? criticalAlerts : "—", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Events (24h)", value: serverConnected ? alerts.length : "—", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Server Health */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Server Health
          </h2>
          {serverConnected && metrics.length > 0 ? (
            <div className="flex items-center justify-around">
              <GaugeCircle value={Math.round(avgCpu)} label="CPU" color="#00d4ff" />
              <GaugeCircle value={Math.round(avgMem)} label="Memory" color="#7c3aed" />
              <GaugeCircle value={Math.round(avgDisk)} label="Disk" color="#10b981" />
            </div>
          ) : (
            <div className="flex items-center justify-around opacity-30">
              <GaugeCircle value={0} label="CPU" color="#00d4ff" />
              <GaugeCircle value={0} label="Memory" color="#7c3aed" />
              <GaugeCircle value={0} label="Disk" color="#10b981" />
            </div>
          )}
        </div>

        {/* Server Status */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-green-400" /> Server Status
          </h2>
          <div className="space-y-3">
            {serverConnected && metrics.length > 0 ? (
              metrics.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${m.status === "online" ? "bg-green-500 animate-pulse" : m.status === "warning" ? "bg-yellow-500" : "bg-red-500"}`} />
                    <span className="text-sm text-gray-300 font-medium">{m.server_name}</span>
                  </div>
                  <span className={`badge text-xs ${m.status === "online" ? "badge-green" : m.status === "warning" ? "badge-orange" : "badge-red"}`}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No servers connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" /> Threat Feed
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {serverConnected && alerts.length > 0 ? (
              alerts.slice(0, 8).map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                return (
                  <div key={alert.id} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${config.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot} mt-1 flex-shrink-0`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-bold ${config.color}`}>{config.label}</span>
                        {alert.source && <span className="text-gray-600">{alert.source}</span>}
                      </div>
                      <p className="text-gray-400 truncate">{alert.title}</p>
                      <p className="text-gray-600 mt-0.5">{new Date(alert.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-600">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-500" />
                <p className="text-sm">{serverConnected ? "No recent threats" : "Connect server to see alerts"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
