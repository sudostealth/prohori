'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('jan-2026');

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate API call
    // await fetch('/api/generate-compliance-report', ...)

    setTimeout(() => {
      setLoading(false);
      toast.success('Compliance report generated successfully');
    }, 2000);
  };

  return (
    <Card className="glass-card border-l-4 border-l-primary h-full">
      <CardHeader>
        <CardTitle className="text-xl font-display font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Audit Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-text-muted">
            Generate a formal compliance executive summary for the Cyber Security Act 2023, Bangladesh.
            This PDF includes threat statistics, uptime logs, and AI-generated compliance statements.
        </p>

        <div className="space-y-2">
            <label className="text-sm font-medium text-white">Select Report Period</label>
            <div className="relative">
                <select
                    className="w-full appearance-none bg-surface-2 border border-border text-white rounded-md h-10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="jan-2026">January 2026</option>
                    <option value="feb-2026">February 2026</option>
                    <option value="mar-2026">March 2026</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-text-muted pointer-events-none" />
            </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-background font-bold h-12">
            {loading ? (
                <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Generating PDF...
                </>
            ) : (
                <>
                   <Download className="mr-2 h-4 w-4" />
                   Generate CSA 2023 Report
                </>
            )}
        </Button>

        <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-white mb-3">Recent Reports</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded hover:bg-surface-2 text-sm text-text-muted cursor-pointer transition-colors">
                    <span>CSA-Audit-Jan-2026.pdf</span>
                    <Download className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-surface-2 text-sm text-text-muted cursor-pointer transition-colors">
                    <span>CSA-Audit-Dec-2025.pdf</span>
                    <Download className="h-4 w-4" />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
