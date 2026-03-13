import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password, companyName, companyType, ownerName } = await req.json();

    if (!email || !password || !companyName || !companyType || !ownerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Securely create the user using the admin client
    const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the user since the user mentioned confirmation is off but we want to allow immediate login
      user_metadata: {
        display_name: ownerName,
      },
    });

    if (userError || !userData.user) {
      console.error("Error creating user:", userError);
      return NextResponse.json(
        { error: userError?.message || "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = userData.user.id;

    // 2. Create the company using the service role client to bypass RLS
    const { data: company, error: companyError } = await adminSupabase
      .from("companies")
      .insert({
        name: companyName,
        type: companyType,
        owner_id: userId,
      })
      .select("id")
      .single();

    if (companyError || !company) {
      console.error("Error creating company:", companyError);
      // Clean up the user if company creation fails to avoid orphaned users
      await adminSupabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Failed to create company" },
        { status: 500 }
      );
    }

    // 3. Update the user profile with the new company_id and display_name
    let retryCount = 0;
    let profileUpdated = false;

    // The profile trigger might take a moment to fire and create the row
    while (retryCount < 5 && !profileUpdated) {
      const { error: profileError } = await adminSupabase
        .from("profiles")
        .update({
          company_id: company.id,
          display_name: ownerName,
        })
        .eq("id", userId);

      if (!profileError) {
        profileUpdated = true;
      } else {
        // Wait 500ms before retrying
        await new Promise((r) => setTimeout(r, 500));
        retryCount++;
      }
    }

    if (!profileUpdated) {
      console.error("Failed to update profile after multiple attempts.");
      // We still return success but log a warning, as the user and company were created.
      return NextResponse.json(
        { warning: "Account created, but profile update timed out." },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, companyId: company.id }, { status: 200 });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
