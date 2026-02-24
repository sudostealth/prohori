import { SupabaseClient } from '@supabase/supabase-js';

export async function checkSubscriptionStatus(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile to find company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.company_id) {
    return null; // Should not happen for valid users
  }

  // Get latest subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return subscription;
}

export async function getPricingPlans(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('platform_content')
    .select('value')
    .eq('key', 'pricing_plans')
    .single();

  if (error || !data) {
    console.error('Error fetching pricing plans:', error);
    return null;
  }

  return data.value;
}
