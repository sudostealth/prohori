'use client';

import { Mail, Plus, Send, Edit, RefreshCw } from 'lucide-react';
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

const mockCampaigns = [
  { id: '1', name: 'March Product Update', audience: 'All Admins', status: 'Draft', sent: '-', date: 'Not scheduled' },
  { id: '2', name: 'Billing Reminder', audience: 'Account Owners', status: 'Active', sent: '142', date: 'Recurring' },
  { id: '3', name: 'New Wazuh Agent Release', audience: 'All Users', status: 'Completed', sent: '1,024', date: 'Jan 15, 2026' },
];

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Email Center
          </h1>
          <p className="text-text-muted mt-2">Manage automated email templates and mass broadcast campaigns via Resend.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-[#1A1A1A] border-[#333] text-white hover:bg-[#222]">
            <RefreshCw className="mr-2 h-4 w-4" /> Sync Stats
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-background">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
             <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-text-muted font-medium">Emails Sent (30d)</CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="text-3xl font-bold text-white">12,450</div>
                 <p className="text-xs text-green-500 mt-1">↑ 14% over last month</p>
             </CardContent>
         </Card>
         <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
             <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-text-muted font-medium">Delivery Rate</CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="text-3xl font-bold text-white">99.8%</div>
                 <p className="text-xs text-green-500 mt-1">Stellar reputation</p>
             </CardContent>
         </Card>
         <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
             <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-text-muted font-medium">Open Rate Avg</CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="text-3xl font-bold text-white">41.2%</div>
                 <p className="text-xs text-text-muted mt-1">Industry standard: 21%</p>
             </CardContent>
         </Card>
      </div>

      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Campaigns & Templates</CardTitle>
          <CardDescription className="text-text-muted">Marketing and transactional email configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-[#333]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">Name</TableHead>
                <TableHead className="text-text-muted">Target Audience</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted">Sent To</TableHead>
                <TableHead className="text-text-muted">Scheduled / Sent Date</TableHead>
                <TableHead className="text-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCampaigns.map((item) => (
                <TableRow key={item.id} className="border-[#333] hover:bg-[#222]/50 transition-colors">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell className="text-text-muted">{item.audience}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.status === 'Completed' ? 'badge-success shadow-none' : item.status === 'Active' ? 'badge-info shadow-none' : 'border-[#333] bg-[#222] text-text-muted shadow-none'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">{item.sent}</TableCell>
                  <TableCell className="text-text-muted">{item.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-text-muted hover:text-white" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-text-muted hover:text-primary" title="Send Test">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
