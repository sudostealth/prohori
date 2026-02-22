'use client';

import { CreditCard, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handlePayNow = () => {
    setLoading(true);
    // Open mocked bKash payment modal or redirect to endpoint
    toast.loading('Redirecting to bKash Secure Checkout...', { id: 'bkash' });
    setTimeout(() => {
      setLoading(false);
      toast.dismiss('bkash');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          Billing & Subscription
        </h1>
        <p className="text-text-muted mt-2">Manage your subscription, payments, and invoices seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-display text-white">Pro Plan</CardTitle>
                <CardDescription className="text-text-muted">Active subscription</CardDescription>
              </div>
              <Badge variant="outline" className="badge-success text-sm flex items-center shadow-none py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="my-4">
              <span className="text-4xl font-bold tracking-tight text-white">৳2,499</span>
              <span className="text-text-muted ml-1">/ month</span>
            </div>
            
            <ul className="space-y-3 mt-6">
              <li className="flex items-center text-text text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> 5 Wazuh Agents Capacity
              </li>
              <li className="flex items-center text-text text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> AI Analyst (LLaMA-3)
              </li>
              <li className="flex items-center text-text text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> CSA Compliance Gen
              </li>
              <li className="flex items-center text-text text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Bug Bounty Center
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3 border-t border-border pt-6">
            <Button variant="outline" className="w-full text-white bg-surface-2 border-border hover:bg-surface-2/80">Change Plan</Button>
            <Button variant="destructive" className="w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">Cancel</Button>
          </CardFooter>
        </Card>

        {/* Next Payment Card */}
        <div className="space-y-6">
          <Card className="glass-card border-none bg-surface/50 border-l-[4px] border-l-primary shadow-[inset_4px_0_0_rgba(0,212,160,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display text-white">Upcoming Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted mb-4">Your next invoice for <strong className="text-white">৳2,499</strong> falls on <strong className="text-white">Mar 1, 2026</strong>.</p>
              
              <Button 
                onClick={handlePayNow} 
                disabled={loading}
                className="w-full bg-[#E2136E] hover:bg-[#E2136E]/90 text-white font-medium rounded-lg h-12 flex items-center justify-center gap-2"
              >
                Pay with bKash
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-none bg-surface/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display text-white">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface-2">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-[#E2136E] bg-white rounded-md px-2 py-1 text-xs">bKash</div>
                  <div>
                    <p className="text-sm font-medium text-white">Saved Token</p>
                    <p className="text-xs text-text-muted">Ends in ••••1234</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-text-muted hover:text-red-500">Remove</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="glass-card border-none bg-surface/50 mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-muted">Invoice</TableHead>
                <TableHead className="text-text-muted">Date</TableHead>
                <TableHead className="text-text-muted">Amount</TableHead>
                <TableHead className="text-text-muted">Status</TableHead>
                <TableHead className="text-text-muted text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {['INV-2026-02-001', 'INV-2026-01-001', 'INV-2025-12-001'].map((inv, i) => (
                <TableRow key={inv} className="border-border hover:bg-surface-2/50 transition-colors">
                  <TableCell className="font-medium text-white">{inv}</TableCell>
                  <TableCell className="text-text-muted">{['Feb 1, 2026', 'Jan 1, 2026', 'Dec 1, 2025'][i]}</TableCell>
                  <TableCell className="text-white">৳2,499</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="badge-success shadow-none">Paid</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">
                      <FileText className="h-4 w-4" />
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
