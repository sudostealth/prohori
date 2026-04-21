import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const path = searchParams.get("path");

    if (!id || !path) {
      return NextResponse.json({ error: "Missing id or path" }, { status: 400 });
    }

    // Attempt to delete from storage (if it exists)
    const { error: storageError } = await supabase.storage.from("logs").remove([path]);
    if (storageError) {
      console.warn("Storage delete error (might already be deleted):", storageError);
    }

    // Delete record from DB
    const { error: dbError } = await supabase
      .from("company_uploaded_logs")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete from database" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown delete error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
