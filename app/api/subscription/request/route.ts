import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { company_id, plan_id, coupon_code, discount_amount, payment_method, transaction_id } = body;

    if (!company_id || !plan_id || !payment_method || !transaction_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure the user actually owns the company or is an admin of the company
    const { data: companyCheck } = await supabase
      .from("companies")
      .select("id")
      .eq("id", company_id)
      .eq("owner_id", user.id)
      .single();

    if (!companyCheck) {
      // Also check if they are in hrm_members for the company
      const { data: hrmCheck } = await supabase
        .from("hrm_members")
        .select("id")
        .eq("company_id", company_id)
        .eq("user_id", user.id)
        .single();

      if (!hrmCheck) {
        return NextResponse.json({ error: "Forbidden: Not an owner or member of this company" }, { status: 403 });
      }
    }

    // Use admin client to bypass RLS issues for inserting subscription request
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("subscription_requests").insert({
      company_id,
      plan_id,
      coupon_code: coupon_code || null,
      discount_amount: discount_amount || 0,
      payment_method,
      transaction_id,
      status: "pending",
    });

    if (error) {
      console.error("Subscription request insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Subscription request handler error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
