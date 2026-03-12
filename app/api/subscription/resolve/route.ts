import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@prohori.app";
    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reqId, companyId, planId, action, rejectReason } = await req.json();

    if (!reqId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    if (action === "approve") {
      const { data: plan } = await adminSupabase.from("subscription_plans").select("billing_cycle").eq("id", planId).single();
      const expiresAt = plan?.billing_cycle === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await adminSupabase.from("subscription_requests").update({ status: "approved", resolved_at: new Date().toISOString() }).eq("id", reqId);

      const { error } = await adminSupabase.from("active_subscriptions").upsert({
        company_id: companyId, plan_id: planId, request_id: reqId, expires_at: expiresAt,
      }, { onConflict: "company_id" });

      if (error) throw error;

    } else if (action === "reject") {
      const { error } = await adminSupabase.from("subscription_requests").update({
        status: "rejected",
        rejection_reason: rejectReason || "Request declined by admin",
        resolved_at: new Date().toISOString(),
      }).eq("id", reqId);

      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Subscription resolve error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
