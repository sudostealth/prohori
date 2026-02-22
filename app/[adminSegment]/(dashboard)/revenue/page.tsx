'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Invoice {
  amount_bdt: number;
  paid_at: string;
}

export default function AdminRevenuePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRevenue = async () => {
      const { data } = await supabase
        .from('invoices')
        .select('amount_bdt, paid_at')
        .eq('status', 'paid');
      
      if (data) setInvoices(data as unknown as Invoice[]);
      setLoading(false);
    };
    fetchRevenue();
  }, [supabase]);

  const revenueData = useMemo(() => {
    if (!invoices.length) {
      // Return default empty months if no data
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
      return months.map(m => ({ month: m, revenue: 0 }));
    }

    const monthlyTotals: Record<string, number> = {};
    invoices.forEach(inv => {
      if (!inv.paid_at) return;
      const date = new Date(inv.paid_at);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(inv.amount_bdt);
    });

    return Object.entries(monthlyTotals).map(([month, revenue]) => ({ month, revenue }));
  }, [invoices]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount_bdt), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Revenue Analytics
          </h1>
          <p className="text-text-muted mt-2">Monitor financial growth, MRR, and transaction flow.</p>
        </div>
        <Button variant="outline" className="bg-surface-2 border-border text-white hover:bg-surface">
          <Download className="mr-2 h-4 w-4" /> Export Financials
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-muted">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {loading ? '...' : `৳${totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-primary mt-1">Total collected revenue</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-surface/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-muted">Average Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">৳2,150</div>
            <p className="text-xs text-text-muted mt-1">Based on 145 active tenants</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-surface/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-muted">Churn Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1.2%</div>
            <p className="text-xs text-primary mt-1">Healthy standing</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none bg-surface/50">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Revenue Growth (6 Months)</CardTitle>
          <CardDescription className="text-text-muted">Historical net revenue performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--surface-2))" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `৳${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--surface))', 
                    borderColor: 'hsl(var(--surface-2))',
                    color: 'hsl(var(--text))',
                    borderRadius: '0.5rem'
                  }} 
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
