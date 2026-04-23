import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getWazuhConnection } from "@/lib/wazuh/connection";
import { WazuhClient } from "@/lib/wazuh/client";
import { decrypt } from "@/lib/encryption";
import { withMonitoring } from "@/lib/monitor";
import { aiRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleGet(request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseServer = createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    const wazuhConnection = await getWazuhConnection(company.id);
    if (!wazuhConnection) {
      return NextResponse.json({ 
        error: "Wazuh not connected",
        message: "Please configure your Wazuh connection first"
      }, { status: 403 });
    }
    
    const credentials = {
      api_url: wazuhConnection.api_url,
      api_username: wazuhConnection.api_username,
      api_password: decrypt(wazuhConnection.api_password_encrypted),
    };
    
    const client = new WazuhClient(credentials);
    
    const [agents, alerts, stats] = await Promise.all([
      client.getAgents(),
      client.getAlerts(undefined, 50),
      client.getStats(),
    ]);
    
    const recentAlerts = alerts.slice(0, 20).map(alert => ({
      id: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity,
      rule_description: alert.rule?.description,
      agent_name: alert.agent?.name,
      full_log: alert.full_log?.substring(0, 500),
    }));
    
    return NextResponse.json({
      success: true,
      serverData: {
        totalAgents: stats.totalAgents,
        activeAgents: stats.activeAgents,
        disconnectedAgents: stats.disconnectedAgents,
        agents: agents.slice(0, 10).map(a => ({
          id: a.id,
          name: a.name,
          ip: a.ip,
          status: a.status,
          version: a.version,
          lastKeepalive: new Date(a.last_keepalive * 1000).toISOString(),
        })),
        recentAlerts,
        alertSummary: {
          critical: alerts.filter(a => a.severity >= 12).length,
          high: alerts.filter(a => a.severity >= 7 && a.severity < 12).length,
          medium: alerts.filter(a => a.severity >= 4 && a.severity < 7).length,
          low: alerts.filter(a => a.severity > 0 && a.severity < 4).length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching server data for AI:", error);
    return NextResponse.json(
      { error: "Failed to fetch server data" },
      { status: 500 }
    );
  }
}

async function handlePost(request: NextRequest): Promise<NextResponse> {
  // Rate limit check — 10 requests per 60s per IP (AI calls are expensive)
  const ip = getClientIp(request);
  const rateCheck = aiRateLimiter.check(ip);
  
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again.", retryAfter: rateCheck.resetAt },
      { status: 429, headers: rateLimitHeaders(rateCheck) }
    );
  }
  
  try {
    const { question, language = "en", serverData, model = "auto" } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }
    
    const serverInfo = serverData ? `
Current Server Status:
- Total Agents: ${serverData.totalAgents || 0}
- Active: ${serverData.activeAgents || 0}
- Disconnected: ${serverData.disconnectedAgents || 0}

Alert Summary:
- Critical: ${serverData.alertSummary?.critical || 0}
- High: ${serverData.alertSummary?.high || 0}
- Medium: ${serverData.alertSummary?.medium || 0}
- Low: ${serverData.alertSummary?.low || 0}

Recent Agents: ${JSON.stringify(serverData.agents?.slice(0, 5) || [])}
` : '';
    
    const systemPrompt = language === "bn"
      ? `আপনি Prohori-র AI নিরাপত্তা বিশ্লেষক এবং সার্ভার প্রশাসক। 
আপনি বাংলায় উত্তর দেবেন।
${serverInfo}
সার্ভারের স্বাস্থ্য বিশ্লেষণ করুন এবং প্রযুক্তিগত তথ্য সহজ বাংলায় ব্যাখ্যা করুন।`
      : `You are Prohori AI Security Analyst and Server Administrator.
${serverInfo}
Analyze the server health and explain technical details in simple language.
Always provide: 1) Current status, 2) Issues found, 3) Recommendations.
Keep responses concise (under 400 words) and actionable.
Reference Bangladesh's Cyber Security Act 2023 when relevant for security threats.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ];
    
    // Default to primary recommendation if not matched
    let targetModel = "qwen/qwen3-235b-a22b";
    if (model === "deepseek/deepseek-r1-0528" || model === "qwen/qwen3-30b-a3b:free" || model === "qwen/qwen3-235b-a22b") {
      targetModel = model;
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prohori.app",
        "X-Title": "Prohori",
      },
      body: JSON.stringify({
        model: targetModel,
        messages: messages,
      })
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("OpenRouter Error:", errorData);
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data = await res.json();
    
    return NextResponse.json({ 
      answer: data.choices?.[0]?.message?.content || "I could not generate a response. Please try again.",
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
      model: data.model,
      provider: "OpenRouter"
    }, { headers: rateLimitHeaders(rateCheck) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const GET = withMonitoring(handleGet);
export const POST = withMonitoring(handlePost);
