'use client';

import { Bug, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockSubmissions = [
  { id: 'SUB-12', researcher: 'Ahmed R.', type: 'SQLi', severity: 'Critical', status: 'Under Review', reward: '৳50,000', date: '2h ago' },
  { id: 'SUB-11', researcher: 'Sarah M.', type: 'XSS', severity: 'High', status: 'Fixed & Paid', reward: '৳25,000', date: '3 days ago' },
  { id: 'SUB-10', researcher: 'John D.', type: 'IDOR', severity: 'Medium', status: 'Fixed', reward: '৳10,000', date: '1 week ago' },
];

export default function BugBountyPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Bug className="h-8 w-8 text-primary" />
            Bug Bounty Marketplace
          </h1>
          <p className="text-text-muted mt-2">Manage your Vulnerability Disclosure Program (VDP) and interact with researchers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" /> New Program
        </Button>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="bg-surface-2 border border-border">
          <TabsTrigger value="submissions" className="data-[state=active]:bg-surface data-[state=active]:text-white">Submissions</TabsTrigger>
          <TabsTrigger value="programs" className="data-[state=active]:bg-surface data-[state=active]:text-white">Active Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="mt-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-display text-white">Recent Reports</CardTitle>
                <CardDescription className="text-text-muted">Vulnerabilities submitted by ethical hackers</CardDescription>
              </div>
              <div className="flex items-center w-64">
                <Input 
                  placeholder="Search submissions..." 
                  className="bg-surface-2 border-border text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-text-muted">ID</TableHead>
                    <TableHead className="text-text-muted">Researcher</TableHead>
                    <TableHead className="text-text-muted">Vulnerability</TableHead>
                    <TableHead className="text-text-muted">Severity</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted text-right">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubmissions.map((sub) => (
                    <TableRow key={sub.id} className="border-border hover:bg-surface-2/50 transition-colors cursor-pointer">
                      <TableCell className="font-medium text-white">{sub.id}</TableCell>
                      <TableCell className="text-white">{sub.researcher}</TableCell>
                      <TableCell className="text-text-muted">{sub.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`badge-${sub.severity.toLowerCase()}`}>
                          {sub.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{sub.status}</TableCell>
                      <TableCell className="text-right text-white font-medium">{sub.reward}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-display text-white">Main Web Application</CardTitle>
                    <CardDescription className="text-text-muted">*.company.com scope</CardDescription>
                  </div>
                  <Badge variant="outline" className="badge-success shadow-none">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-muted">Our primary SaaS platform handling sensitive PII and payment data.</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-surface-2 p-3 rounded-lg border border-border">
                    <div className="text-xs text-text-muted mb-1">Critical Reward</div>
                    <div className="text-lg font-bold text-red-500">৳50,000</div>
                  </div>
                  <div className="bg-surface-2 p-3 rounded-lg border border-border">
                    <div className="text-xs text-text-muted mb-1">High Reward</div>
                    <div className="text-lg font-bold text-orange-500">৳25,000</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-none border-dashed border-2 border-surface-2 bg-transparent flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-surface/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-white">Create New Program</h3>
              <p className="text-sm text-text-muted mt-2 max-w-xs">Define a new scope and reward tier for your upcoming mobile application.</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
