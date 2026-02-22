'use client';

import { FileCheck, Download, Plus, Clock, KeySquare, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockReports = [
  { id: '1', date: 'Feb 2026', framework: 'CSA 2023', status: 'Ready', genDate: 'Mar 1, 2026' },
  { id: '2', date: 'Jan 2026', framework: 'CSA 2023', status: 'Ready', genDate: 'Feb 1, 2026' },
  { id: '3', date: 'Dec 2025', framework: 'CSA 2023', status: 'Ready', genDate: 'Jan 1, 2026' },
];

export default function CompliancePage() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('Generating Compliance Data...', { id: 'genInfo' });
    
    // Simulating API call for LaTeX PDF generation
    setTimeout(() => {
      toast.success('Report Generation Completed!', { id: 'genInfo' });
      setGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-primary" />
            Compliance Engine
          </h1>
          <p className="text-text-muted mt-2">Automated reports mapped against the Bangladesh Cyber Security Act 2023.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" />
          {generating ? 'Generating...' : 'Generate Latest Report'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader>
            <CardTitle className="text-xl font-display text-white">CSA 2023 Readiness</CardTitle>
            <CardDescription className="text-text-muted">Current status of your platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center bg-surface-2 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-2 rounded-full">
                  <KeySquare className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Data Encryption</h4>
                  <p className="text-xs text-text-muted">At rest and in transit</p>
                </div>
              </div>
              <Badge variant="outline" className="badge-success">Compliant</Badge>
            </div>
            
            <div className="flex justify-between items-center bg-surface-2 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Log Retention</h4>
                  <p className="text-xs text-text-muted">90+ Days continuous logging</p>
                </div>
              </div>
              <Badge variant="outline" className="badge-success">Compliant</Badge>
            </div>

            <div className="flex justify-between items-center bg-surface-2 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/10 p-2 rounded-full">
                  <ShieldAlert className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Incident Response</h4>
                  <p className="text-xs text-text-muted">Documented threat responses</p>
                </div>
              </div>
              <Badge variant="outline" className="badge-medium">Needs Review</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-surface/50">
          <CardHeader>
            <CardTitle className="text-xl font-display text-white">Report Archives</CardTitle>
            <CardDescription className="text-text-muted">Past monthly compliance PDFs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-text-muted">Month</TableHead>
                  <TableHead className="text-text-muted">Framework</TableHead>
                  <TableHead className="text-text-muted text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id} className="border-border hover:bg-surface-2/50">
                    <TableCell className="font-medium text-white">{report.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                        {report.framework}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-text-muted hover:text-white" onClick={() => toast.success(`Downloading ${report.date} Report...`)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
