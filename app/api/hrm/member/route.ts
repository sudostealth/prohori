import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { companyId, name, email, password, role } = await req.json();

    if (!companyId || !name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify requester is authorized to add members to this company
    const userClient = createClient();
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: requesterProfile, error: profileError } = await userClient
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !requesterProfile ||
      requesterProfile.company_id !== companyId ||
      (requesterProfile.role !== "owner" && requesterProfile.role !== "admin")
    ) {
      return NextResponse.json({ error: "Forbidden: Not authorized to add members" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    // 1. Create the user in Supabase Auth securely
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: name,
      },
    });

    if (authError || !authData.user) {
      console.error("Auth error creating team member:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create user account" },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;

    // 2. Add to hrm_members to track them in the HRM page
    const { error: hrmError } = await adminSupabase.from("hrm_members").insert({
      id: newUserId,
      company_id: companyId,
      name,
      email,
      role,
      is_active: true,
    });

    if (hrmError) {
      console.error("Error inserting into hrm_members:", hrmError);
      await adminSupabase.auth.admin.deleteUser(newUserId); // Cleanup
      return NextResponse.json({ error: "Failed to link team member to company" }, { status: 500 });
    }

    // 3. Update the automatically created profile with company details
    // Wait slightly to let the Supabase trigger create the profile first
    let retryCount = 0;
    let profileUpdated = false;

    while (retryCount < 5 && !profileUpdated) {
      const { data: updatedProfile, error: profileError } = await adminSupabase
        .from("profiles")
        .update({
          company_id: companyId,
          display_name: name,
          role: role,
        })
        .eq("id", newUserId)
        .select("id");

      if (!profileError && updatedProfile && updatedProfile.length > 0) {
        profileUpdated = true;
      } else {
        await new Promise((r) => setTimeout(r, 500));
        retryCount++;
      }
    }

    if (!profileUpdated) {
      console.warn("Failed to update team member profile after multiple attempts.");
      // We don't fail the request completely since they were created in auth and hrm.
    }

    // 4. Log the action
    await adminSupabase.from("audit_logs").insert({
      company_id: companyId,
      user_id: user.id,
      action: "Created team member",
      resource: email,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ success: true, message: "Member added successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Add team member error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
