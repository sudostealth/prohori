import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import * as xlsx from "xlsx";

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

    // We use the service key to bypass RLS for fetching the company
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Process file to get row count and summary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    let rowCount = 0;
    let summary = "";

    if (fileExt === 'csv') {
      const text = buffer.toString('utf-8');
      const parsed = Papa.parse(text, { header: true });
      rowCount = parsed.data.length;
      summary = `CSV File with ${rowCount} rows. Columns: ${parsed.meta.fields?.join(', ') || 'unknown'}`;
    } else if (fileExt === 'xls' || fileExt === 'xlsx') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = xlsx.utils.sheet_to_json(worksheet);
      rowCount = json.length;
      const headers = json.length > 0 ? Object.keys(json[0] as object) : [];
      summary = `Excel File with ${rowCount} rows. Columns: ${headers.join(', ')}`;
    } else {
      // Treat as plain text log
      const text = buffer.toString('utf-8');
      rowCount = text.split('\n').filter(line => line.trim().length > 0).length;
      summary = `Log File with ${rowCount} lines.`;
    }

    // Upload to Supabase Storage
    const filePath = `${company.id}/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('company_logs')
      .upload(filePath, buffer, {
        contentType: file.type || 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Insert record in company_uploaded_logs
    const { data: logRecord, error: dbError } = await supabaseAdmin
      .from('company_uploaded_logs')
      .insert({
        company_id: company.id,
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        row_count: rowCount,
        summary: summary
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Try to clean up storage
      await supabaseAdmin.storage.from('company_logs').remove([filePath]);
      return NextResponse.json({ error: "Failed to save log metadata" }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: logRecord });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
