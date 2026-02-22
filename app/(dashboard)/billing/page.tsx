'use client';

import { PlanCard } from '@/components/billing/PlanCard';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const handleUpgrade = (plan: string) => {
      // Simulate bKash redirect
      toast.loading(`Redirecting to bKash for ${plan} plan...`);
      setTimeout(() => {
          toast.dismiss();
          toast.success('Simulated payment successful! Plan upgraded.');
      }, 2000);
  };

  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-display font-bold text-white">Billing & Subscription</h1>
          <p className="text-text-muted">Manage your plan and view payment history.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <PlanCard
               name="Basic"
               price="৳999"
               features={['1 Agent', 'Email Alerts', 'Basic SIEM', 'Compliance Reports']}
               onUpgrade={() => handleUpgrade('Basic')}
           />
           <PlanCard
               name="Pro"
               price="৳2,499"
               features={['5 Agents', 'WhatsApp Alerts', 'AI Analyst', 'Bug Bounty Marketplace', 'Priority Support']}
               current={true}
           />
           <PlanCard
               name="Enterprise"
               price="৳9,999"
               features={['Unlimited Agents', 'All Features', 'Custom SLA', 'Dedicated Support', 'White-label Reports']}
               onUpgrade={() => handleUpgrade('Enterprise')}
           />
       </div>

       <div className="space-y-4">
           <h3 className="text-xl font-bold font-display text-white">Invoice History</h3>
           <InvoiceTable />
       </div>
    </div>
  );
}
