"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CompliancePage() {
  const [generating, setGenerating] = useState(false);

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
        <p className="text-gray-400 text-sm mt-1.5 font-medium">Generate reports to monitor your organization&apos;s adherence to the Cyber Security Act (CSA) 2023.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generate Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-3">
          <Card className="bg-navy-900/60 border-white/10 backdrop-blur-xl h-full flex flex-col justify-between p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Executive Reports</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate highly detailed PDF reports based on your current Wazuh logs and alerts, mapped to national frameworks.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <Button 
                 onClick={handleGenerate} 
                 disabled={generating}
                 size="lg"
                 className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(0,212,255,0.3)]"
               >
                 {generating ? (
                   <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}><Clock className="w-5 h-5 mr-2" /></motion.div> Generating Report...</>
                 ) : (
                   <><Download className="w-5 h-5 mr-2" /> Generate Compliance Report</>
                 )}
               </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
