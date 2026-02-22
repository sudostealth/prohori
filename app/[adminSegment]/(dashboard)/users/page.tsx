'use client';

import { Users, Filter, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const mockUsers = [
  { id: '1', name: 'Zayed Ahmed', email: 'zayed@techstartup.bd', company: 'TechStartup BD', role: 'Owner', lastLogin: '10 mins ago', status: 'Active' },
  { id: '2', name: 'Nadia Islam', email: 'nadia@retailshop.com', company: 'RetailShop BD', role: 'Admin', lastLogin: '1 hour ago', status: 'Active' },
  { id: '3', name: 'Rakib Hasan', email: 'rakib@abc.inc', company: 'ABC Inc', role: 'Viewer', lastLogin: '2 days ago', status: 'Inactive' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-text-muted mt-2">Manage all registered users across all tenant companies.</p>
        </div>
      </div>

      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-display text-white">Platform Users</CardTitle>
            <CardDescription className="text-text-muted">Currently viewing 3 users</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search users by name or email..." className="w-64 bg-[#1A1A1A] border-[#333] text-white" />
            <Button variant="outline" className="bg-[#1A1A1A] border-[#333] text-white hover:bg-[#222]">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-[#333]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">User</TableHead>
                <TableHead className="text-text-muted">Company</TableHead>
                <TableHead className="text-text-muted">System Role</TableHead>
                <TableHead className="text-text-muted">Last Login</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} className="border-[#333] hover:bg-[#222]/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-[#333]">
                        <AvatarFallback className="bg-[#222] text-white">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted font-medium">{user.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#333] bg-[#222] text-text-muted shadow-none">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.status === 'Active' ? 'badge-success shadow-none' : 'badge-info shadow-none'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-text-muted hover:text-primary">
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
  );
}
