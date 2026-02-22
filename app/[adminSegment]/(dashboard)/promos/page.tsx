'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

import { Gift, Plus, Copy, Edit2, Trash2 } from 'lucide-react';
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
import { toast } from 'react-hot-toast';

interface Promo {
  id: string;
  code: string;
  discount_percent: number;
  used_count: number;
  max_uses: number | null;
  valid_until: string | null;
  is_active: boolean;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPromos = async () => {
      const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (data) setPromos(data);
      setLoading(false);
    };
    fetchPromos();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Promo Code Manager
          </h1>
          <p className="text-text-muted mt-2">Create and track discount codes for sales campaigns.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background">
          <Plus className="mr-2 h-4 w-4" /> Create Code
        </Button>
      </div>

      <Card className="glass-card border-none bg-surface/50">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Discount Campaigns</CardTitle>
          <CardDescription className="text-text-muted">Manage active and inactive promotional codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">Code</TableHead>
                <TableHead className="text-text-muted">Discount</TableHead>
                <TableHead className="text-text-muted">Usage</TableHead>
                <TableHead className="text-text-muted">Expires</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-text-muted py-8">Loading promos...</TableCell></TableRow>
              ) : promos.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-text-muted py-8">No promo codes found.</TableCell></TableRow>
              ) : promos.map((promo) => (
                <TableRow key={promo.id} className="border-border hover:bg-surface-2/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-white bg-surface-2 px-2 py-1 rounded-md border border-border">
                        {promo.code}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-white" onClick={() => toast.success('Code copied')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary font-medium">{promo.discount_percent}% OFF</TableCell>
                  <TableCell className="text-text-muted">{promo.used_count} / {promo.max_uses || 'Unlimited'}</TableCell>
                  <TableCell className="text-text-muted">{promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={promo.is_active ? 'badge-success shadow-none' : 'badge-info shadow-none'}>
                      {promo.is_active ? 'Active' : 'Archived'}
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
