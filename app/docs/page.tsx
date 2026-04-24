"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Copy, Terminal, Server, BookOpen, ExternalLink, ArrowLeft } from "lucide-react";

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeBlocks = {
    ubuntu: "curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
    centos: "curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
    windows: "Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.2-1.msi -OutFile wazuh-agent.msi; msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER='10.0.0.2' WAZUH_REGISTRATION_SERVER='10.0.0.2'"
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Prohori Docs</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Learn how to use Prohori, integrate Wazuh, and set up your security monitoring environment.
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* Section 1: Using the Website */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-3 border-b border-white/10 pb-4">
              <Terminal className="w-6 h-6 text-purple-400" />
              Using Prohori
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-lg font-medium text-purple-300 mb-3">1. Connect Your Agents</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Start by installing the Wazuh agent on your endpoints. Once connected, Prohori will automatically fetch security events and logs from your infrastructure.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-lg font-medium text-purple-300 mb-3">2. AI Analysis</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Navigate to the AI Analyst section. Our system processes your logs and provides plain-language explanations and remediation steps for any detected threats.
                </p>
              </div>
            </div>

            {/* CSS Diagram Placeholder */}
            <div className="mt-8 p-8 rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
              <div className="relative flex flex-col md:flex-row items-center justify-between max-w-2xl mx-auto gap-4">
                <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 relative z-10">
                  <Server className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-400">Endpoints</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent hidden md:block relative">
                  <motion.div
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full blur-[4px]"
                  />
                </div>
                <div className="w-32 h-32 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col items-center justify-center gap-2 relative z-10 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
                  <Shield className="w-8 h-8 text-purple-400" />
                  <span className="text-xs text-purple-300">Wazuh Server</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent hidden md:block relative">
                  <motion.div
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full blur-[4px]"
                  />
                </div>
                <div className="w-32 h-32 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center gap-2 relative z-10 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  <span className="text-xs text-cyan-300">Prohori AI</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Wazuh Installation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-3 border-b border-white/10 pb-4">
              <Server className="w-6 h-6 text-cyan-400" />
              Wazuh Installation
            </h2>

            <div className="space-y-6">
              {[
                { title: "Ubuntu / Debian", code: codeBlocks.ubuntu, id: 1 },
                { title: "CentOS / RHEL", code: codeBlocks.centos, id: 2 },
                { title: "Windows Agent", code: codeBlocks.windows, id: 3 },
              ].map((os) => (
                <div key={os.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">{os.title}</span>
                    <button
                      onClick={() => copyToClipboard(os.code, os.id)}
                      className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                    >
                      {copiedIndex === os.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <code className="text-sm text-cyan-300 whitespace-nowrap font-mono">
                      {os.code}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 3: Official Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-3 border-b border-white/10 pb-4">
              <ExternalLink className="w-6 h-6 text-blue-400" />
              Official Resources
            </h2>
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-blue-300 mb-1">Wazuh Documentation</h3>
                <p className="text-sm text-gray-400">Access the comprehensive official Wazuh documentation for advanced configurations.</p>
              </div>
              <a
                href="https://documentation.wazuh.com/current/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors whitespace-nowrap"
              >
                Visit Official Docs
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

// Temporary icon components to avoid adding dependencies if they don't exist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Brain(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Shield(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.8 0 4.7.8 6.6 2a1 1 0 0 1 .4.8z"/>
    </svg>
  );
}
