'use client';

import { Building2, Clock, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockCompanies = [
  { id: 'C-1', name: 'TechStartup BD', industry: 'Software', plan: 'Pro', agents: '4/5', status: 'Active' },
  { id: 'C-2', name: 'RetailShop BD', industry: 'E-commerce', plan: 'Basic', agents: '1/1', status: 'Active' },
  { id: 'C-3', name: 'FutureLogistics', industry: 'Logistics', plan: 'Enterprise', agents: '0/25', status: 'Onboarding' },
];

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Company Management
          </h1>
          <p className="text-text-muted mt-2">Oversee client organizations, agent deployment, and onboarding review.</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-[#111111] border border-[#222]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#222]">All Companies</TabsTrigger>
          <TabsTrigger value="onboarding" className="data-[state=active]:bg-[#222]">Pending Onboarding (1)</TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-[#222]">Agent Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-display text-white">Organizations</CardTitle>
                <CardDescription className="text-text-muted">Registered tenants.</CardDescription>
              </div>
              <Input placeholder="Search companies..." className="w-64 bg-[#1A1A1A] border-[#333] text-white" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-[#333]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-text-muted">Company Name</TableHead>
                    <TableHead className="text-text-muted">Industry</TableHead>
                    <TableHead className="text-text-muted">Subscription</TableHead>
                    <TableHead className="text-text-muted">Agents</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCompanies.map((c) => (
                    <TableRow key={c.id} className="border-[#333] hover:bg-[#222]/50 transition-colors cursor-pointer">
                      <TableCell className="font-medium text-white">{c.name}</TableCell>
                      <TableCell className="text-text-muted">{c.industry}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 shadow-none">
                          {c.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-text-muted">
                          <Server className="w-4 h-4" /> {c.agents}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={c.status === 'Active' ? 'badge-success shadow-none' : 'badge-info shadow-none'}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-yellow-500/30 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Onboarding Review
              </CardTitle>
              <CardDescription className="text-text-muted">Review newly registered companies before granting full platform access.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="p-4 bg-[#1A1A1A] border border-[#333] rounded-lg flex items-center justify-between">
                 <div>
                   <h3 className="font-medium text-white">FutureLogistics Ltd.</h3>
                   <p className="text-sm text-text-muted">BIN: 00987123912 | Requested Plan: Enterprise</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">Reject</Button>
                   <Button className="bg-primary hover:bg-primary/90 text-background">Approve Access</Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
