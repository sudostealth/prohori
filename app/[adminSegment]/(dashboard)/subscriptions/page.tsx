'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'react-hot-toast';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  price_bdt: number;
  expires_at: string | null;
  companies: { name: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, plan, status, price_bdt, expires_at, companies(name)')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setSubscriptions(data as unknown as Subscription[]);
      }
      setLoading(false);
    };
    fetchSubscriptions();
  }, [supabase]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;

        toast.success(`Subscription ${newStatus}`);
        // Update local state
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error: any) {
        console.error('Error updating subscription:', error);
        toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Subscription Management
          </h1>
          <p className="text-text-muted mt-2">Oversee tenant billing plans and resolve payment issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" /> {subscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-500" /> {subscriptions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-text-muted mt-1">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Payment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" /> {subscriptions.filter(s => ['overdue', 'failed'].includes(s.status)).length}
            </div>
            <p className="text-xs text-text-muted mt-1">Requires immediate review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-surface-2 border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-surface data-[state=active]:text-white">All Subscriptions</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-surface data-[state=active]:text-white">Pending ({subscriptions.filter(s => s.status === 'pending').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white">Billing Plans</CardTitle>
              <CardDescription className="text-text-muted">Manage tenant tiers and billing cycles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-text-muted">Company</TableHead>
                    <TableHead className="text-text-muted">Plan</TableHead>
                    <TableHead className="text-text-muted">Amount</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted">Next Billing</TableHead>
                    <TableHead className="text-text-muted text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-text-muted py-8">Loading subscriptions...</TableCell></TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-text-muted py-8">No subscriptions found.</TableCell></TableRow>
                  ) : subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-border hover:bg-surface-2/50 transition-colors">
                      <TableCell className="font-medium text-white">{sub.companies?.name || 'Unknown'}</TableCell>
                      <TableCell className="capitalize">{sub.plan}</TableCell>
                      <TableCell>৳{Number(sub.price_bdt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          sub.status === 'active' ? 'badge-success shadow-none' : 
                          sub.status === 'overdue' ? 'badge-critical shadow-none' : 
                          sub.status === 'pending' ? 'badge-warning text-yellow-500 border-yellow-500 shadow-none' :
                          sub.status === 'rejected' ? 'badge-destructive shadow-none' :
                          'badge-info shadow-none'
                        }>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        {sub.status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8" onClick={() => handleUpdateStatus(sub.id, 'active')}>Approve</Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleUpdateStatus(sub.id, 'rejected')}>Reject</Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">Manage</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
            <Card className="glass-card border-none bg-surface/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white">Pending Requests</CardTitle>
              <CardDescription className="text-text-muted">Approve or reject subscription requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-text-muted">Company</TableHead>
                    <TableHead className="text-text-muted">Plan</TableHead>
                    <TableHead className="text-text-muted">Amount</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.filter(s => s.status === 'pending').length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-text-muted py-8">No pending requests.</TableCell></TableRow>
                  ) : subscriptions.filter(s => s.status === 'pending').map((sub) => (
                    <TableRow key={sub.id} className="border-border hover:bg-surface-2/50 transition-colors">
                      <TableCell className="font-medium text-white">{sub.companies?.name || 'Unknown'}</TableCell>
                      <TableCell className="capitalize">{sub.plan}</TableCell>
                      <TableCell>৳{Number(sub.price_bdt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="badge-warning text-yellow-500 border-yellow-500 shadow-none">
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8" onClick={() => handleUpdateStatus(sub.id, 'active')}>Approve</Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleUpdateStatus(sub.id, 'rejected')}>Reject</Button>
                            </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
