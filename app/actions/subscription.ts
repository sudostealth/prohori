'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSubscriptionRequest(plan: string, price: number) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get company_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
     throw new Error('No company found for user');
  }

  // Check if there is already a pending request or active subscription
  // We allow creating a new request even if one exists (it might replace or be additional),
  // but for simplicity let's just insert a new one.
  // The schema allows multiple subscriptions per company technically, but logic usually implies one active.

  // Create subscription request
  const { error } = await supabase.from('subscriptions').insert({
    company_id: profile.company_id,
    plan: plan.toLowerCase(),
    price_bdt: price,
    status: 'pending',
    billing_cycle: 'monthly'
  });

  if (error) {
    console.error('Error creating subscription:', error);
    throw new Error(error.message);
  }

  revalidatePath('/billing');
  return { success: true };
}
