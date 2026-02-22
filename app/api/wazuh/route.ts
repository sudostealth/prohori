import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Basic in-memory rate limiting
const rateLimit = new Map<string, { count: number, resetAt: number }>();
const LIMIT = 100; // higher limit for wazuh proxy
const WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { endpoint, method = 'GET' } = await req.json();

    // Rate Limiting Logic
    const ip = req.headers.get('x-forwarded-for') || 'internal-service';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);
    
    if (userLimit && now < userLimit.resetAt) {
      if (userLimit.count >= LIMIT) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
      userLimit.count += 1;
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }

    if (!process.env.WAZUH_API_BASE_URL) {
      return NextResponse.json({ 
        data: { message: "Mocked Wazuh API Response since WAZUH_URL is missing", endpoint, method },
        mocked: true
      });
    }

    // In a real implementation this would fetch with basic auth from the actual Wazuh API:
    // const auth = Buffer.from(`${process.env.WAZUH_API_USER}:${process.env.WAZUH_API_PASSWORD}`).toString('base64');
    // const res = await fetch(`${process.env.WAZUH_API_BASE_URL}${endpoint}`, { headers: { Authorization: `Basic ${auth}` }});
    // return NextResponse.json(await res.json());

    return NextResponse.json({ 
      data: { message: "Mocked Wazuh API Response", endpoint, method },
      mocked: true
    });
  } catch {
    return NextResponse.json({ error: 'Failed to proxy Wazuh request' }, { status: 500 });
  }
}
