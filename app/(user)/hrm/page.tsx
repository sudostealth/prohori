'use client';

import { Users, Plus, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockEmployees = [
  { id: '1', name: 'Rahim Khan', email: 'rahim@company.com', role: 'Owner', mfa: true, status: 'Active' },
  { id: '2', name: 'Alia Rahman', email: 'alia@company.com', role: 'Admin', mfa: true, status: 'Active' },
  { id: '3', name: 'Hasan Mahmud', email: 'hasan@company.com', role: 'Viewer', mfa: false, status: 'Pending' },
];

export default function HRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            HRM & Access Control
          </h1>
          <p className="text-text-muted mt-2">Manage employee access, roles, and review security logs.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white">Team Members</CardTitle>
              <CardDescription className="text-text-muted">Users with access to your Prohori portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-text-muted">Employee</TableHead>
                    <TableHead className="text-text-muted">Role</TableHead>
                    <TableHead className="text-text-muted">Security</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((emp) => (
                    <TableRow key={emp.id} className="border-border hover:bg-surface-2/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-surface-2 text-white">{emp.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{emp.name}</p>
                            <p className="text-xs text-text-muted">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge variant="outline" className="border-border bg-surface-2 text-text">
                          {emp.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {emp.mfa ? (
                          <div className="flex items-center text-xs text-green-500">
                            <ShieldCheck className="w-3 h-3 mr-1" /> MFA Enabled
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-yellow-500">
                            No MFA
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={emp.status === 'Active' ? 'badge-success shadow-none' : 'badge-info shadow-none'}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-text-muted hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-white">Role Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <strong className="text-white block mb-1">Owner</strong>
                <p className="text-text-muted text-xs">Full access including billing and deleting the company account.</p>
              </div>
              <div className="border-t border-border pt-3">
                <strong className="text-white block mb-1">Admin</strong>
                <p className="text-text-muted text-xs">Can manage alerts, agents, reports, and invite users.</p>
              </div>
              <div className="border-t border-border pt-3">
                <strong className="text-white block mb-1">Viewer</strong>
                <p className="text-text-muted text-xs">Read-only access to dashboards and reports.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
