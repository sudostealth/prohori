import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withMonitoring } from "@/lib/monitor";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ServiceStatus {
  status: 'ok' | 'error';
  latency_ms?: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    env: {
      supabase: boolean;
      groq: boolean;
      wazuh_key: boolean;
      service_role: boolean;
    };
  };
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = performance.now();
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('subscription_plans')
      .select('id')
      .limit(1)
      .maybeSingle();

    const latency_ms = Math.round(performance.now() - start);

    if (error) {
      return { status: 'error', latency_ms, error: error.message };
    }
    return { status: 'ok', latency_ms };
  } catch (err) {
    const latency_ms = Math.round(performance.now() - start);
    return {
      status: 'error',
      latency_ms,
      error: err instanceof Error ? err.message : 'Unknown DB error',
    };
  }
}

async function handleGet(): Promise<NextResponse> {
  const [database] = await Promise.all([checkDatabase()]);

  const env = {
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    groq: !!process.env.GROQ_API_KEY,
    wazuh_key: !!process.env.WAZUH_ENCRYPTION_KEY,
    service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const allOk = database.status === 'ok';
  const overallStatus: HealthResponse['status'] = allOk ? 'ok' : 'degraded';

  const body: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: { database, env },
  };

  const httpStatus = overallStatus === 'ok' ? 200 : 503;
  return NextResponse.json(body, { status: httpStatus });
}

export const GET = withMonitoring(handleGet);