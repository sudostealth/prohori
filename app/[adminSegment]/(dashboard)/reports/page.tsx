'use client';

import { FileText, Download, BarChart2, ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminReportsPage() {
  const reports = [
    { title: "Monthly Business Review", desc: "Overview of platform growth, new MRR, and churn rate.", icon: BarChart2, color: "text-blue-500" },
    { title: "Financial Transactions", desc: "Detailed breakdown of all bKash payments and failed charges.", icon: Activity, color: "text-green-500" },
    { title: "Global Security Posture", desc: "Aggregated threat intelligence across all Prohori connected agents.", icon: ShieldAlert, color: "text-red-500" },
    { title: "Platform Activity Log", desc: "Comprehensive audit trail of administrator and user actions.", icon: FileText, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Admin Reports Center
          </h1>
          <p className="text-text-muted mt-2">Generate and download comprehensive platform-wide reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center mb-2">
                <report.icon className={`h-5 w-5 ${report.color}`} />
              </div>
              <CardTitle className="text-lg font-display text-white">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted">{report.desc}</p>
              <Button variant="outline" className="w-full bg-[#1A1A1A] border-[#333] text-white hover:bg-[#222] hover:text-primary">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222] mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Scheduled Reports</CardTitle>
          <CardDescription className="text-text-muted">Configure automated reporting via email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 border border-dashed border-[#333] rounded-lg">
            <p className="text-text-muted">No automated schedules configured.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
