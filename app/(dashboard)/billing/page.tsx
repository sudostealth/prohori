import { checkSubscriptionStatus, getPricingPlans } from '@/lib/subscription';
import { createServerClient } from '@/lib/supabase/server';
import { SubscriptionManager } from '@/components/billing/SubscriptionManager';
import { InvoiceTable } from '@/components/billing/InvoiceTable';

export default async function BillingPage() {
  const supabase = createServerClient();

  const subscription = await checkSubscriptionStatus(supabase);
  const plans = await getPricingPlans(supabase);

  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-display font-bold text-white">Billing & Subscription</h1>
          <p className="text-text-muted">Manage your plan and view payment history.</p>
       </div>

       {plans ? (
          <SubscriptionManager subscription={subscription} plans={plans} />
       ) : (
          <div className="text-red-500">Failed to load pricing plans.</div>
       )}

       <div className="space-y-4">
           <h3 className="text-xl font-bold font-display text-white">Invoice History</h3>
           <InvoiceTable />
       </div>
    </div>
  );
}
