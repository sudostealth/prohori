import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, language = "en", provider = "groq" } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    const systemPrompt = language === "bn"
      ? `আপনি Prohori-র AI নিরাপত্তা বিশ্লেষক। আপনি বাংলায় উত্তর দেবেন। প্রযুক্তিগত নিরাপত্তা বিষয়গুলি সহজ বাংলায় ব্যাখ্যা করুন। সংক্ষিপ্ত এবং কার্যকর পরামর্শ দিন।`
      : `You are Prohori's AI Security Analyst for Bangladeshi SMEs. 
         Explain security threats in simple, non-technical language. 
         Always provide: 1) What the threat is, 2) Why it's dangerous, 3) Specific next steps to mitigate it.
         Keep responses concise (under 300 words) and actionable.
         Reference Bangladesh's Cyber Security Act 2023 when relevant.`;

    let answer = "";

    if (provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Missing Groq API Key" }, { status: 500 });
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: question }],
        max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || "600"),
        temperature: parseFloat(process.env.GROQ_TEMPERATURE || "0.5"),
      });
      answer = completion.choices[0]?.message?.content || "";
    } else if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: question }] }],
          generationConfig: {
             temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.5"),
             maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "600"),
          }
        }),
      });
      const data = await res.json();
      answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (provider === "openrouter") {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Missing OpenRouter API Key" }, { status: 500 });
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://prohori.app",
          "X-Title": "Prohori Security Suite",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemma-3-12b-it:free",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: question }],
          max_tokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || "600"),
          temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || "0.5"),
        })
      });
      const data = await res.json();
      answer = data.choices?.[0]?.message?.content || "";
    } else if (provider === "huggingface") {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Missing HuggingFace API Key" }, { status: 500 });
      const model = process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-7B-Instruct";
      // Constructing prompt in a way acceptable by HF Inference endpoint for chat
      const prompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${question}<|im_end|>\n<|im_start|>assistant\n`;
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
             max_new_tokens: parseInt(process.env.HUGGINGFACE_MAX_TOKENS || "600"),
             temperature: parseFloat(process.env.HUGGINGFACE_TEMPERATURE || "0.5"),
             return_full_text: false,
          }
        })
      });
      const data = await res.json();
      answer = data[0]?.generated_text || "";
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    if (!answer) {
      answer = "I could not generate a response from the selected model. Please try again.";
    }

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
