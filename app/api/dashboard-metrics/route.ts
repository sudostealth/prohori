export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = req.nextUrl.searchParams.get("companyId");

    // Auth Check
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
    if (!profile || profile.company_id !== companyId) {
        return NextResponse.json({ error: "Unauthorized access to company data" }, { status: 403 });
    }
    const source = req.nextUrl.searchParams.get("source"); // "log" or "wazuh"
    const logId = req.nextUrl.searchParams.get("logId");

    let contextData = "";

    if (source === "log" && logId) {
      const { data: logData } = await supabase
        .from("company_uploaded_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (logData) {
        contextData = `Analyze the following uploaded log file summary: ${logData.summary}. Number of rows: ${logData.row_count}. File name: ${logData.file_name}.`;
      }
    } else if (source === "wazuh" && companyId) {
       const { data: alerts } = await supabase
        .from("security_alerts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(50);

       contextData = `Analyze the following recent security alerts from Wazuh: ${JSON.stringify(alerts?.map(a => ({title: a.title, severity: a.severity, source: a.source})) || [])}`;
    }

    const defaultStructure = {
      securityOverview: { critical: 0, high: 0, agentsAffected: 0, attackersIp: [] },
      threatCategories: [],
      topMitreTactics: [],
      attackTimeline: [],
      systemHealthAlerts: [],
      topAttackerIps: []
    };

    if (!contextData) {
        return NextResponse.json(defaultStructure);
    }

    const systemPrompt = `You are a cybersecurity AI. Based on the provided context, generate a JSON response representing dashboard metrics.
The JSON must have the following exact structure:
{
  "securityOverview": {
    "critical": number,
    "high": number,
    "agentsAffected": number,
    "attackersIp": string[]
  },
  "threatCategories": [
    { "category": string, "count": number, "status": "active" | "resolved" }
  ],
  "topMitreTactics": [
    { "tactic": string, "count": number }
  ],
  "attackTimeline": [
    { "time": string, "event": string, "status": "critical" | "high" | "medium" | "low" }
  ],
  "systemHealthAlerts": [
    { "alert": string, "severity": "critical" | "warning" | "info" }
  ],
  "topAttackerIps": [
    { "ip": string, "count": number }
  ]
}
Do not include any markdown formatting, just the raw JSON object. If information is missing from the context to accurately fill a field, infer a plausible structured estimate or leave it as 0/empty arrays as appropriate, but strictly maintain the JSON structure.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing OpenRouter API Key" }, { status: 500 });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prohori.app",
        "X-Title": "Prohori",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast structured output model
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: contextData }]
      })
    });

    if (!res.ok) {
      throw new Error("AI provider error");
    }

    const data = await res.json();
    let answer = data.choices?.[0]?.message?.content || "{}";

    // Clean potential markdown wrap
    if (answer.startsWith("```json")) answer = answer.replace(/```json\n/g, "").replace(/\n```/g, "");
    if (answer.startsWith("```")) answer = answer.replace(/```\n/g, "").replace(/\n```/g, "");

    let parsedData;
    try {
        parsedData = JSON.parse(answer);
        // Basic validation
        if (!parsedData.securityOverview) parsedData.securityOverview = defaultStructure.securityOverview;
    } catch {
        console.error("Failed to parse AI JSON:", answer);
        parsedData = defaultStructure;
    }

    return NextResponse.json(parsedData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
