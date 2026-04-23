export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const format = req.nextUrl.searchParams.get("format") || "pdf";

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, companies(name)")
      .eq("id", user.id)
      .single();

    const company = profile?.companies as Record<string, unknown> | null;
    const companyName = (company?.name as string) || "Company";
    const dateStr = new Date().toLocaleDateString("en-BD");
    const timeStr = new Date().toLocaleString("en-BD");

    if (format === "pdf") {
      const doc = new jsPDF();

      // Add Watermark
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(60);
      doc.text("PROHORI (প্রহরী)", 30, 150, { angle: 45 });

      // Reset text color for content
      doc.setTextColor(0, 0, 0);

      // Add Header
      doc.setFontSize(24);
      doc.setTextColor(124, 58, 237); // Purple
      doc.text("PROHORI (প্রহরী) Security Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Digital Resilience Suite — Confidential", 14, 30);

      // Company Info
      autoTable(doc, {
        startY: 40,
        head: [['Company Information', 'Details']],
        body: [
          ['Company', companyName],
          ['Report Date', dateStr],
          ['Generated At', timeStr],
          ['Compliance', 'CSA 2023 Monitored'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 212, 255] }
      });

      // Security Summary
      autoTable(doc, {
        startY: (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ? (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY + 15 : 60,
        head: [['Security Summary Metric', 'Status']],
        body: [
          ['Prohori Agent Status', 'Active'],
          ['Last Scan', new Date().toISOString()],
          ['Threat Level', 'Low'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237] }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("প্রহরী | Prohori Security Suite | prohori.app", 14, 280);

      const pdfBuffer = doc.output('arraybuffer');

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="prohori-report-${Date.now()}.pdf"`,
        },
      });

    } else if (format === "docx") {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "PROHORI (প্রহরী) Security Report",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "Digital Resilience Suite — Confidential",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Company Information",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ text: `Company: ${companyName}` }),
            new Paragraph({ text: `Report Date: ${dateStr}` }),
            new Paragraph({ text: `Generated At: ${timeStr}` }),
            new Paragraph({ text: `Compliance: CSA 2023 Monitored` }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Security Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ text: `Prohori Agent Status: Active` }),
            new Paragraph({ text: `Last Scan: ${new Date().toISOString()}` }),
            new Paragraph({ text: `Threat Level: Low` }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "প্রহরী | Prohori Security Suite | prohori.app",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="prohori-report-${Date.now()}.docx"`,
        },
      });

    } else {
      // HTML Report (default)
      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Prohori Security Report</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; position: relative;}
  .watermark { position: absolute; top: 30%; left: 10%; font-size: 80px; color: rgba(200, 200, 200, 0.2); transform: rotate(-45deg); z-index: -1; white-space: nowrap; pointer-events: none;}
  .header { background: linear-gradient(135deg, #00d4ff, #7c3aed); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
  h1 { margin: 0 0 5px 0; font-size: 24px; }
  .subtitle { opacity: 0.8; font-size: 14px; }
  .section { margin-bottom: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: rgba(255,255,255,0.9); }
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
  <div class="watermark">PROHORI (প্রহরী)</div>
  <div class="header">
    <h1>🛡️ PROHORI (প্রহরী) Security Report</h1>
    <div class="subtitle">Digital Resilience Suite — Confidential</div>
  </div>
  
  <div class="section">
    <h2>Company Information</h2>
    <table>
      <tr><th>Company</th><td>${companyName}</td></tr>
      <tr><th>Report Date</th><td>${dateStr}</td></tr>
      <tr><th>Generated At</th><td>${timeStr}</td></tr>
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
    }

  } catch (err) {
    console.error("Report generation failed:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
