import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as Papa from "papaparse";
import * as xlsx from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const companyId = formData.get("company_id") as string;

    if (!file || !companyId) {
      return NextResponse.json({ error: "Missing file or company_id" }, { status: 400 });
    }

    // Read file contents to parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rowCount = 0;
    let summary = "";

    // Parse logic
    if (file.name.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rowCount = parsed.data.length;
      if (parsed.meta.fields) {
        summary = `Columns: ${parsed.meta.fields.slice(0, 5).join(", ")}${parsed.meta.fields.length > 5 ? "..." : ""}`;
      }
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      rowCount = jsonData.length;
      if (rowCount > 0) {
        const fields = Object.keys(jsonData[0] as Record<string, unknown>);
        summary = `Columns: ${fields.slice(0, 5).join(", ")}${fields.length > 5 ? "..." : ""}`;
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const filePath = `${companyId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("logs")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Insert record
    const { error: dbError } = await supabase.from("company_uploaded_logs").insert({
      company_id: companyId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      row_count: rowCount,
      summary: summary || "Raw log data",
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Rollback storage if db fails (best effort)
      await supabase.storage.from("logs").remove([filePath]);
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const msg = err instanceof Error ? err.message : "Unknown upload error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
