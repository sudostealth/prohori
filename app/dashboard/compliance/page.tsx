"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, FileText, Download, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const requirements = [
  { id: "req-1", title: "Access Control & Authentication", status: "compliant", desc: "Multi-factor authentication enforced for all admin accounts." },
  { id: "req-2", title: "Data Encryption", status: "compliant", desc: "All sensitive data is encrypted at rest and in transit." },
  { id: "req-3", title: "Incident Response Plan", status: "compliant", desc: "Automated alert pipelines established to incident response team." },
  { id: "req-4", title: "Vulnerability Management", status: "warning", desc: "Missing patches on 2 endpoint machines in the finance subnet." },
  { id: "req-5", title: "Audit Logging", status: "compliant", desc: "System logs are retained for a minimum of 365 days securely." },
  { id: "req-6", title: "Network Security", status: "pending", desc: "Review of external firewall rules pending for quarterly assessment." },
];

export default function CompliancePage() {
  const [generating, setGenerating] = useState(false);
  const score = 84;

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(false);
    toast.success("CSA 2023 Compliance Report generated successfully! Downloading...");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Compliance Reports</h1>
        <p className="text-gray-400 text-sm mt-1.5 font-medium">Monitor your organization&apos;s adherence to the Cyber Security Act (CSA) 2023.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="bg-navy-900/60 border-white/10 backdrop-blur-xl h-full flex flex-col justify-center items-center p-8 text-center relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
             <ShieldAlert className="w-12 h-12 text-cyan-400 mb-4 opacity-80" />
             <div className="relative mb-2">
               <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                 <motion.circle 
                   cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                   strokeDasharray="283" strokeDashoffset="283"
                   strokeLinecap="round"
                   animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
                   transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                   className="text-cyan-400 drop-shadow-[0_0_8px_currentColor]"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-extrabold text-white">{score}%</span>
               </div>
             </div>
             <p className="text-sm font-bold text-gray-300 uppercase tracking-widest mt-4">CSA 2023 Score</p>
          </Card>
        </motion.div>

        {/* Generate Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
          <Card className="bg-navy-900/60 border-white/10 backdrop-blur-xl h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Executive Reports</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate highly detailed PDF and LaTeX reports perfectly formatted for local submission to regulatory bodies.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="bg-black/20 rounded-xl p-5 border border-white/5 mb-6">
                 <div className="flex items-center justify-between mb-2">
                   <h4 className="text-sm font-bold text-white">Q3 Architecture Review</h4>
                   <span className="text-xs text-gray-500 font-medium">Last generated: 14 days ago</span>
                 </div>
                 <p className="text-xs text-gray-400 w-3/4 leading-relaxed">Includes endpoint posture, firewall rule evaluations, and unauthorized access attempt logs mapped to national frameworks.</p>
               </div>

               <Button 
                 onClick={handleGenerate} 
                 disabled={generating}
                 size="lg"
                 className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(0,212,255,0.3)]"
               >
                 {generating ? (
                   <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}><Clock className="w-5 h-5 mr-2" /></motion.div> Generating LaTeX Report...</>
                 ) : (
                   <><Download className="w-5 h-5 mr-2" /> Generate Compliance Report</>
                 )}
               </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">Requirement Breakdown</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirements.map((req, i) => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 + (i * 0.1) }}
              className="bg-navy-900/40 border border-white/10 p-5 rounded-xl hover:bg-navy-800/60 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                 <h4 className="text-sm font-bold text-white leading-tight">{req.title}</h4>
                 {req.status === "compliant" && <div className="p-1 rounded-full bg-green-500/10"><CheckCircle className="w-4 h-4 text-green-400" /></div>}
                 {req.status === "warning" && <div className="p-1 rounded-full bg-orange-500/10"><ShieldAlert className="w-4 h-4 text-orange-400" /></div>}
                 {req.status === "pending" && <div className="p-1 rounded-full bg-gray-500/10"><Clock className="w-4 h-4 text-gray-400" /></div>}
              </div>
              <p className="text-xs font-medium text-gray-400/90 leading-relaxed">{req.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
