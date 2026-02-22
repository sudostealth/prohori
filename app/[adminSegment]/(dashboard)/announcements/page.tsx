'use client';

import { Megaphone, Plus, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
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

const mockAnnouncements = [
  { id: '1', title: 'System Maintenance Window', priority: 'High', date: 'March 10, 2026', time: '02:00 AM BDT', active: true },
  { id: '2', title: 'New Feature: Custom Compliance Reports', priority: 'Normal', date: 'Feb 25, 2026', time: '10:00 AM BDT', active: true },
  { id: '3', title: 'Scheduled Wazuh Upgrade', priority: 'Normal', date: 'Jan 15, 2026', time: '01:00 AM BDT', active: false },
];

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Platform Announcements
          </h1>
          <p className="text-text-muted mt-2">Publish notices, updates, and alerts to all tenant dashboards.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" /> New Announcement
        </Button>
      </div>

      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Broadcast History</CardTitle>
          <CardDescription className="text-text-muted">Manage currently visible and past announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-[#333]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">Title</TableHead>
                <TableHead className="text-text-muted">Priority</TableHead>
                <TableHead className="text-text-muted">Schedule</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnnouncements.map((item) => (
                <TableRow key={item.id} className="border-[#333] hover:bg-[#222]/50 transition-colors">
                  <TableCell className="font-medium text-white">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.priority === 'High' ? 'badge-high shadow-none' : 'badge-info shadow-none'}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-text-muted flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {item.date} <Clock className="w-3 h-3 ml-2" /> {item.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.active ? 'badge-success shadow-none' : 'badge-info shadow-none'}>
                      {item.active ? 'Visible' : 'Archived'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-text-muted hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-text-muted hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
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
