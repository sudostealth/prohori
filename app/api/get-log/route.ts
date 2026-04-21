import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing log id" }, { status: 400 });
    }

    const { data: log, error: dbError } = await supabase
      .from("company_uploaded_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError || !log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ log });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown get error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
