import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

// Basic in-memory rate limiting (Note: in serverless this clears on cold start, use Redis for production)
const rateLimit = new Map<string, { count: number, resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 60 * 1000;

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const message = body.message;
    const history = body.history || [];

    // Rate Limiting Logic
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);
    
    if (userLimit && now < userLimit.resetAt) {
      if (userLimit.count >= LIMIT) {
        return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
      }
      userLimit.count += 1;
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }

    if (!process.env.GROQ_API_KEY || !groq) {
      return NextResponse.json({ 
        reply: "Groq API key not configured. This is a mock response. In production, LLaMA-3 would analyze your query: '" + message + "'"
      });
    }

    const messages = [
      { role: 'system', content: 'You are Prohori AI Security Analyst, an expert in cybersecurity advising non-technical business owners. Speak professionally and clearly.' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      model: 'llama3-70b-8192',
      temperature: 0.5,
      max_tokens: 1024,
    });

    return NextResponse.json({ reply: completion.choices[0]?.message?.content || 'No response' });
  } catch (error) {
    console.error('Groq AI error:', error);
    return NextResponse.json({ error: 'Failed to process AI query' }, { status: 500 });
  }
}
