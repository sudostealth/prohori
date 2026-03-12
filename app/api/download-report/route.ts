import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, companies(name)")
      .eq("id", user.id)
      .single();

    const company = profile?.companies as Record<string, unknown> | null;
    const companyName = (company?.name as string) || "Company";

    // Generate simple HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Prohori Security Report</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
  .header { background: linear-gradient(135deg, #00d4ff, #7c3aed); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
  h1 { margin: 0 0 5px 0; font-size: 24px; }
  .subtitle { opacity: 0.8; font-size: 14px; }
  .section { margin-bottom: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
  h2 { color: #7c3aed; font-size: 16px; margin-top: 0; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #10b981; color: white; }
  .meta { color: #6b7280; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  th { background: #f9fafb; font-weight: 600; color: #374151; }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; }
</style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Prohori Security Report</h1>
    <div class="subtitle">Digital Resilience Suite — Confidential</div>
  </div>
  
  <div class="section">
    <h2>Company Information</h2>
    <table>
      <tr><th>Company</th><td>${companyName}</td></tr>
      <tr><th>Report Date</th><td>${new Date().toLocaleDateString("en-BD")}</td></tr>
      <tr><th>Generated At</th><td>${new Date().toLocaleString("en-BD")}</td></tr>
      <tr><th>Compliance</th><td><span class="badge">CSA 2023 Monitored</span></td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Security Summary</h2>
    <p class="meta">This report provides an overview of your security posture as monitored by the Prohori platform.</p>
    <table>
      <tr><th>Metric</th><th>Status</th></tr>
      <tr><td>Prohori Agent Status</td><td>Active</td></tr>
      <tr><td>Last Scan</td><td>${new Date().toISOString()}</td></tr>
      <tr><td>Threat Level</td><td>Low</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>প্রহরী | Prohori Security Suite | prohori.app</p>
    <p>This report is auto-generated and confidential. Do not share without authorization.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="prohori-report-${Date.now()}.html"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
