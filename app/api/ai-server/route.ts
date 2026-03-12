import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getWazuhConnection } from "@/lib/wazuh/connection";
import { WazuhClient } from "@/lib/wazuh/client";
import { decrypt } from "@/lib/encryption";
import { withMonitoring } from "@/lib/monitor";
import { aiRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { AIService } from "@/lib/ai";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize AI service with provider configurations
const aiService = new AIService({
  providers: {
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      temperature: parseFloat(process.env.GROQ_TEMPERATURE || '0.5'),
      maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '600', 10)
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.5'),
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '600', 10)
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'google/gemma-3-12b-it:free',
      temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.5'),
      maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '600', 10)
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY || '',
      model: process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
      temperature: parseFloat(process.env.HUGGINGFACE_TEMPERATURE || '0.5'),
      maxTokens: parseInt(process.env.HUGGINGFACE_MAX_TOKENS || '600', 10)
    }
  },
  priority: [
    'groq' as const,
    'gemini' as const,
    'openrouter' as const,
    'huggingface' as const
  ],
  fallbackEnabled: process.env.AI_FALLBACK_ENABLED === 'true' || true
});

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
    const { question, language = "en", serverData } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }
    
    // Check if any AI provider is configured
    const providerStatus = aiService.getProviderStatus();
    const anyProviderConfigured = Object.values(providerStatus).some(status => status.configured);
    
    if (!anyProviderConfigured) {
      return NextResponse.json({ error: "No AI providers configured" }, { status: 500 });
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
    
    const aiResponse = await aiService.generateCompletion(messages);
    
    return NextResponse.json({ 
      answer: aiResponse.text,
      usage: aiResponse.usage,
      model: aiResponse.model,
      provider: aiResponse.provider 
    }, { headers: rateLimitHeaders(rateCheck) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const GET = withMonitoring(handleGet);
export const POST = withMonitoring(handlePost);