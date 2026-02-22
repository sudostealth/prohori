'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

import { FileEdit, Globe, LayoutTemplate, Plus } from 'lucide-react';
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

interface ContentItem {
  key: string;
  description: string;
  updated_by: string;
  updated_at: string;
}

export default function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('platform_content').select('key, description, updated_by, updated_at').order('updated_at', { ascending: false });
      if (data) setContentItems(data);
      setLoading(false);
    };
    fetchContent();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <FileEdit className="h-8 w-8 text-primary" />
            Content Manager
          </h1>
          <p className="text-text-muted mt-2">Manage blog posts, public site copy, and downloadable assets.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" /> New Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" /> Public Site Views (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">45,210</div>
            <p className="text-xs text-green-500 mt-1">↑ 22% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-purple-500" /> Published Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">24</div>
            <p className="text-xs text-text-muted mt-1">18 Blogs, 6 Whitepapers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none bg-surface/50">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Site Content & Assets</CardTitle>
          <CardDescription className="text-text-muted">Marketing materials and landing page text overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">Title</TableHead>
                <TableHead className="text-text-muted">Type</TableHead>
                <TableHead className="text-text-muted">Author</TableHead>
                <TableHead className="text-text-muted">Published</TableHead>
                <TableHead className="text-text-muted">Views</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-text-muted py-8">Loading content blocks...</TableCell></TableRow>
              ) : contentItems.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-text-muted py-8">No content records found.</TableCell></TableRow>
              ) : contentItems.map((item) => (
                <TableRow key={item.key} className="border-border hover:bg-surface-2/50 transition-colors">
                  <TableCell className="font-mono text-white text-sm">
                    {item.key}
                  </TableCell>
                  <TableCell className="text-text-muted max-w-[300px] truncate" title={item.description}>{item.description}</TableCell>
                  <TableCell className="text-text-muted">{item.updated_by || 'System'}</TableCell>
                  <TableCell className="text-text-muted">{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-text-muted">-</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="badge-success shadow-none">
                      Published
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">Edit</Button>
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
