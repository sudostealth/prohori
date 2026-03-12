import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createAdminClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function getUserCompanyId(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .single();
  return company?.id || null;
}

export async function getCompanySubscription(companyId: string) {
  const supabase = createClient();
  const { data: subscription } = await supabase
    .from('active_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('company_id', companyId)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .single();
  return subscription;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const companyId = await getUserCompanyId(userId);
  if (!companyId) return false;
  
  const subscription = await getCompanySubscription(companyId);
  return !!subscription;
}

export async function checkPlanLimit(
  companyId: string,
  usageType: 'servers' | 'users' | 'ai_queries' | 'api_calls' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await getCompanySubscription(companyId);
  
  if (!subscription) {
    return { allowed: false, current: 0, limit: 0 };
  }
  
  const limits = subscription.plan?.limits || {};
  const limit = limits[usageType] || 0;
  
  if (limit === 0 || limit === null || limit === undefined) {
    return { allowed: true, current: 0, limit: -1 };
  }
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const supabase = createClient();
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('company_id', companyId)
    .eq('usage_type', usageType)
    .eq('month', month)
    .eq('year', year)
    .single();
  
  const current = usage?.count || 0;
  
  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function incrementUsage(
  companyId: string,
  usageType: 'servers' | 'users' | 'ai_queries' | 'api_calls' | 'storage',
  amount: number = 1
): Promise<boolean> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const supabase = createClient();
  
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, count')
    .eq('company_id', companyId)
    .eq('usage_type', usageType)
    .eq('month', month)
    .eq('year', year)
    .single();
  
  if (existing) {
    const { error } = await supabase
      .from('usage_tracking')
      .update({ 
        count: existing.count + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
    return !error;
  } else {
    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        company_id: companyId,
        usage_type: usageType,
        count: amount,
        period: 'monthly',
        month,
        year,
      });
    return !error;
  }
}
