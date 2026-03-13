"use client";
import { useState } from "react";
import { 
  Activity, AlertTriangle, Server, Download, RefreshCw,
  Cpu, CheckCircle2, XCircle, AlertCircle,
  Copy, Check, Terminal, ChevronDown, ChevronUp
} from "lucide-react";
import type { SecurityAlert, ServerMetric } from "@/types";

interface DashboardMainProps {
  company: Record<string, unknown> | null;
  alerts: SecurityAlert[];
  metrics: ServerMetric[];
  activeSub: Record<string, unknown> | null;
  serverConnected: boolean;
}

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500", label: "CRITICAL" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500", label: "HIGH" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-500", label: "MEDIUM" },
  low:      { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", dot: "bg-green-500", label: "LOW" },
  info:     { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500", label: "INFO" },
};

const CONNECTION_STEPS = [
  {
    title: "Linux / Ubuntu Server",
    commands: [
      "curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh",
      "sudo bash wazuh-install.sh --wazuh-agent",
      "sudo WAZUH_MANAGER='YOUR_PROHORI_SERVER_IP' WAZUH_AGENT_NAME='$(hostname)' /var/ossec/bin/wazuh-control start",
    ],
  },
  {
    title: "Docker Container",
    commands: [
      "docker pull prohori/agent:latest",
      "docker run -d --name prohori-agent \\",
      "  -e PROHORI_SERVER='YOUR_SERVER_IP' \\",
      "  -e PROHORI_KEY='YOUR_API_KEY' \\",
      "  --restart unless-stopped prohori/agent:latest",
    ],
  },
  {
    title: "Windows Server",
    commands: [
      "# Download agent installer",
      "Invoke-WebRequest -Uri 'https://prohori.app/agent/windows' -OutFile 'prohori-agent.msi'",
      "# Install with your server details",
      "msiexec.exe /i prohori-agent.msi SERVER='YOUR_SERVER_IP' KEY='YOUR_API_KEY' /quiet",
    ],
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

function CopyableCommand({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-start gap-2 group">
      <code className="flex-1 text-green-400 font-mono text-xs break-all">{cmd}</code>
      <button
        onClick={copy}
        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-gray-600 transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function OnboardingPanel() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="glass-card p-8 border-cyan-500/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center">
          <Terminal className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Connect Your Server</h2>
          <p className="text-gray-400 text-sm">Follow the steps below to start monitoring your infrastructure</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= activeStep ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-500"}`}>
              {i < activeStep ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            {i < 2 && <div className={`h-px flex-1 transition-all ${i < activeStep ? "bg-cyan-500" : "bg-white/5"}`} />}
          </div>
        ))}
      </div>

      {/* Server type selector */}
      <div className="space-y-3 mb-6">
        {CONNECTION_STEPS.map((step, i) => (
          <div key={step.title} className={`rounded-xl border overflow-hidden transition-all ${i === activeStep ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/5 bg-white/2 cursor-pointer hover:border-white/10"}`}>
            <button
              onClick={() => setActiveStep(i)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Server className={`w-4 h-4 ${i === activeStep ? "text-cyan-400" : "text-gray-600"}`} />
                <span className={`font-medium text-sm ${i === activeStep ? "text-white" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
              {i === activeStep ? (
                <ChevronUp className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {i === activeStep && (
              <div className="terminal mx-4 mb-4">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="text-gray-500 text-xs ml-2">terminal</span>
                </div>
                <div className="terminal-body space-y-1.5">
                  {step.commands.map((cmd, j) => (
                    <CopyableCommand key={j} cmd={cmd} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-purple-300 mb-1">First-time setup</p>
          <p className="text-xs text-purple-400/80">
            After installing the agent, allow 2–5 minutes for initial data to appear in your dashboard.
            Your unique API key is available in Settings → Security Keys.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-300 mb-1">Not seeing any data?</p>
          <p className="text-xs text-red-400/80">
            If your server is not connecting, ensure that the Prohori API key and server IP are correct. Check that port 1514 (Wazuh Agent) and 1515 (Wazuh Enrollment) are open on your server&apos;s firewall. Also verify that the agent service is actively running.
          </p>
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
}: DashboardMainProps) {
  const [downloading, setDownloading] = useState(false);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {company?.name as string} &mdash; Real-time threat monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Generating..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Show onboarding if not connected */}
      {!serverConnected && <OnboardingPanel />}

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
