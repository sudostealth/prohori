import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, language = "en", provider = "auto" } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    const systemPrompt = language === "bn"
      ? `আপনি Prohori-র AI নিরাপত্তা বিশ্লেষক। আপনি বাংলায় উত্তর দেবেন। প্রযুক্তিগত নিরাপত্তা বিষয়গুলি সহজ বাংলায় ব্যাখ্যা করুন। সংক্ষিপ্ত এবং কার্যকর পরামর্শ দিন।`
      : `You are Prohori's AI Security Analyst for Bangladeshi SMEs. 
         Explain security threats in simple, non-technical language. 
         Always provide: 1) What the threat is, 2) Why it's dangerous, 3) Specific next steps to mitigate it.
         Keep responses concise (under 300 words) and actionable.
         Reference Bangladesh's Cyber Security Act 2023 when relevant.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing OpenRouter API Key" }, { status: 500 });

    // Pass the provider variable as the model
    let targetModel = "qwen/qwen3-235b-a22b";
    if (provider === "deepseek/deepseek-r1-0528" || provider === "qwen/qwen3-30b-a3b:free" || provider === "qwen/qwen3-235b-a22b") {
      targetModel = provider;
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
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: question }],
      })
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("OpenRouter Error:", errorData);
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data = await res.json();
    let answer = data.choices?.[0]?.message?.content || "";

    if (!answer) {
      answer = "I could not generate a response from the selected model. Please try again.";
    }

    return NextResponse.json({
      answer,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
      model: data.model,
      provider: "OpenRouter"
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
