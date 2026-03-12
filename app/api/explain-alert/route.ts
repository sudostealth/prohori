import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, language = "en" } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: "AI analyst is not configured. Please provide a GROQ_API_KEY.", error: "Missing API key" });
    }

    // Lazy-load Groq to avoid build-time initialization error
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey });

    const systemPrompt = language === "bn"
      ? `আপনি Prohori-র AI নিরাপত্তা বিশ্লেষক। আপনি বাংলায় উত্তর দেবেন। প্রযুক্তিগত নিরাপত্তা বিষয়গুলি সহজ বাংলায় ব্যাখ্যা করুন। সংক্ষিপ্ত এবং কার্যকর পরামর্শ দিন।`
      : `You are Prohori's AI Security Analyst for Bangladeshi SMEs. 
         Explain security threats in simple, non-technical language. 
         Always provide: 1) What the threat is, 2) Why it's dangerous, 3) Specific next steps to mitigate it.
         Keep responses concise (under 300 words) and actionable.
         Reference Bangladesh's Cyber Security Act 2023 when relevant.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 512,
      temperature: 0.5,
    });

    const answer = completion.choices[0]?.message?.content || "I could not generate a response.";
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
