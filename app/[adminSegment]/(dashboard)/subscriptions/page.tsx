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

interface Subscription {
  id: string;
  plan: string;
  status: string;
  price_bdt: number;
  expires_at: string | null;
  companies: { name: string };
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
              <CheckCircle className="h-6 w-6 text-primary" /> 142
            </div>
            <p className="text-xs text-text-muted mt-1">+12 this month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Payment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" /> 3
            </div>
            <p className="text-xs text-text-muted mt-1">Requires immediate review</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-surface/50 border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Trials Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" /> 8
            </div>
            <p className="text-xs text-text-muted mt-1">Within next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-surface-2 border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-surface data-[state=active]:text-white">All Subscriptions</TabsTrigger>
          <TabsTrigger value="issues" className="data-[state=active]:bg-surface data-[state=active]:text-white">Payment Issues (3)</TabsTrigger>
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
                          'badge-info shadow-none'
                        }>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card className="glass-card border-none bg-surface/50 ring-1 ring-red-500/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Action Required: Failed Payments
              </CardTitle>
              <CardDescription className="text-text-muted">These accounts have failed renewal charges and may face suspension.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="p-4 bg-surface-2 border border-border rounded-lg flex items-center justify-between">
                 <div>
                   <h3 className="font-medium text-white">RetailShop BD</h3>
                   <p className="text-sm text-text-muted">Pro Plan (৳5,000) • Failure Reason: bKash Insufficient Balance • 2 Days Past Due</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button variant="outline" className="border-border text-white hover:bg-surface-2">Send Reminder</Button>
                   <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Suspend Access</Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
