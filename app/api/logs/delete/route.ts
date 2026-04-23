import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { logId } = await request.json();

    if (!logId) {
      return NextResponse.json({ error: "No logId provided" }, { status: 400 });
    }

    // Get the log to find its file_path
    const { data: logRecord, error: getError } = await supabaseAdmin
      .from('company_uploaded_logs')
      .select('file_path')
      .eq('id', logId)
      .eq('company_id', company.id)
      .single();

    if (getError || !logRecord) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin
      .storage
      .from('company_logs')
      .remove([logRecord.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('company_uploaded_logs')
      .delete()
      .eq('id', logId)
      .eq('company_id', company.id);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete log metadata" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to process deletion" },
      { status: 500 }
    );
  }
}
