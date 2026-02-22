import { ShieldAlert, Server, Activity, ArrowRight, Bot, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertsChart } from '@/components/dashboard/AlertsChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Mock Data
const stats = [
  { title: "Risk Score", value: "B+", desc: "Good Standing", icon: Activity, color: "text-primary" },
  { title: "Active Agents", value: "12/12", desc: "All instances reporting", icon: Server, color: "text-blue-500" },
  { title: "Critical Threats", value: "2", desc: "Requires attention", icon: ShieldAlert, color: "text-red-500" },
];

const mockChartData = [
  { time: '00:00', critical: 0, high: 2, medium: 5 },
  { time: '04:00', critical: 1, high: 1, medium: 8 },
  { time: '08:00', critical: 0, high: 3, medium: 12 },
  { time: '12:00', critical: 2, high: 5, medium: 15 },
  { time: '16:00', critical: 0, high: 2, medium: 7 },
  { time: '20:00', critical: 0, high: 1, medium: 4 },
  { time: '24:00', critical: 0, high: 0, medium: 2 },
];

const mockAlerts = [
  { id: 'ALT-1', timestamp: '2 mins ago', severity: 'Critical', rule: 'Ransomware detected', agent: 'web-prod-1', status: 'Open' },
  { id: 'ALT-2', timestamp: '15 mins ago', severity: 'High', rule: 'Suspicious login attempt', agent: 'db-main', status: 'Investigating' },
  { id: 'ALT-3', timestamp: '1 hour ago', severity: 'Medium', rule: 'File modification in /etc', agent: 'web-prod-2', status: 'Blocked' },
  { id: 'ALT-4', timestamp: '3 hours ago', severity: 'Low', rule: 'New port opened', agent: 'dev-env', status: 'Resolved' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Security Overview</h1>
          <p className="text-text-muted text-lg">System status and recent threat detections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card border-none bg-surface/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-text-muted mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 glass-card border-none bg-surface/50">
          <CardHeader>
            <CardTitle className="text-xl font-display text-white">Threat Activity (24h)</CardTitle>
            <CardDescription className="text-text-muted">Total alerts categorized by severity</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsChart data={mockChartData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 glass-card border-none bg-surface/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-display text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1">
            <Button variant="outline" className="w-full justify-start text-white border-surface-2 hover:bg-surface-2 bg-surface/50" asChild>
              <Link href="/ai-analyst">
                <Bot className="mr-2 h-4 w-4 text-primary" />
                Ask AI Analyst
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-surface-2 hover:bg-surface-2 bg-surface/50" asChild>
              <Link href="/compliance">
                <FileCheck className="mr-2 h-4 w-4 text-primary" />
                Generate CSA Report
              </Link>
            </Button>
            <div className="mt-auto pt-4 border-t border-surface-2">
              <p className="text-sm text-text-muted mb-3">Agent Health Status</p>
              <div className="w-full bg-surface-2 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-right mt-1 text-primary">100% Online</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none bg-surface/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-display text-white">Recent Alerts</CardTitle>
            <CardDescription className="text-text-muted">Latest detections from your connected agents</CardDescription>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary/90">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-text-muted">Time</TableHead>
                  <TableHead className="text-text-muted">Rule</TableHead>
                  <TableHead className="text-text-muted">Agent</TableHead>
                  <TableHead className="text-text-muted">Severity</TableHead>
                  <TableHead className="text-text-muted">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAlerts.map((alert) => (
                  <TableRow key={alert.id} className="border-border hover:bg-surface-2/50 transition-colors">
                    <TableCell className="text-text-muted whitespace-nowrap">{alert.timestamp}</TableCell>
                    <TableCell className="font-medium text-white">{alert.rule}</TableCell>
                    <TableCell className="text-text-muted">{alert.agent}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`badge-${alert.severity.toLowerCase()}`}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-muted">{alert.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
