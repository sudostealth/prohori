/**
 * lib/audit-logger.ts
 * Structured audit logging helper — writes to the existing `audit_logs` table.
 * Uses the Supabase admin client (service role) to bypass RLS reliably.
 *
 * Usage:
 *   await logAdminAction({
 *     action: 'subscription.approved',
 *     resource: 'subscription_requests',
 *     resourceId: requestId,
 *     userId: adminUserId,
 *     companyId: targetCompanyId,
 *     details: { plan_id, payment_method },
 *     req,
 *   });
 */

import { createClient } from '@supabase/supabase-js';
import type { AuditDetails } from '@/types';
import type { NextRequest } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface AuditEventParams {
  /** Action identifier e.g. 'subscription.approved', 'wazuh.connection.created' */
  action: string;
  /** Table or resource type */
  resource?: string;
  /** ID of the affected record */
  resourceId?: string;
  /** User performing the action */
  userId: string;
  /** Company context (optional for admin-only actions) */
  companyId?: string;
  /** Any relevant structured data */
  details?: AuditDetails;
  /** Next.js request (to extract IP and user-agent) */
  req?: NextRequest | Request;
}

/**
 * Write an audit log entry.
 * Failures are logged to console but never throw — logging must not break business logic.
 */
export async function logAdminAction(params: AuditEventParams): Promise<void> {
  try {
    const supabase = getAdminClient();

    const ipAddress = params.req
      ? (params.req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         params.req.headers.get('x-real-ip') ||
         null)
      : null;

    const userAgent = params.req
      ? (params.req.headers.get('user-agent') || null)
      : null;

    const { error } = await supabase.from('audit_logs').insert({
      company_id: params.companyId ?? null,
      user_id: params.userId,
      action: params.action,
      resource: params.resourceId
        ? `${params.resource ?? 'unknown'}:${params.resourceId}`
        : (params.resource ?? null),
      details: params.details ?? {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error('[audit-logger] Failed to write audit log:', error.message, {
        action: params.action,
        userId: params.userId,
      });
    }
  } catch (err) {
    console.error('[audit-logger] Unexpected error:', err);
  }
}

// ── Predefined action constants ──────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  // Subscriptions
  SUBSCRIPTION_APPROVED: 'subscription.approved',
  SUBSCRIPTION_REJECTED: 'subscription.rejected',

  // Coupons
  COUPON_CREATED: 'coupon.created',
  COUPON_DELETED: 'coupon.deleted',
  COUPON_VALIDATED: 'coupon.validated',

  // Wazuh Connections
  WAZUH_CONNECTION_CREATED: 'wazuh.connection.created',
  WAZUH_CONNECTION_UPDATED: 'wazuh.connection.updated',
  WAZUH_CONNECTION_DELETED: 'wazuh.connection.deleted',
  WAZUH_CONNECTION_TESTED: 'wazuh.connection.tested',

  // User management
  USER_ROLE_CHANGED: 'user.role_changed',
  USER_SUSPENDED: 'user.suspended',

  // Plans
  PLAN_CREATED: 'plan.created',
  PLAN_UPDATED: 'plan.updated',
  PLAN_DELETED: 'plan.deleted',
} as const;
