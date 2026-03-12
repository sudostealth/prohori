/**
 * lib/monitor.ts
 * Lightweight APM (Application Performance Monitoring) for Next.js API routes.
 *
 * - Measures response time using performance.now()
 * - Adds X-Response-Time header to every response
 * - Emits structured JSON logs: { method, path, status, duration_ms, timestamp }
 * - Logs to stdout — can be ingested by Datadog, Logtail, Axiom, etc.
 *
 * Usage:
 *   export const GET = withMonitoring(async (req) => { ... });
 */

import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse | Response>;

interface ApiLog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  ip?: string;
  user_agent?: string;
}

/**
 * Wraps a Next.js route handler with performance tracking and logging.
 */
export function withMonitoring(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx?: unknown): Promise<NextResponse | Response> => {
    const start = performance.now();

    let response: NextResponse | Response;
    try {
      response = await handler(req, ctx);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      logRequest(req, 500, duration);
      throw err;
    }

    const duration = Math.round(performance.now() - start);
    logRequest(req, response.status, duration);

    // Clone response to inject custom header (Response is immutable)
    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

function logRequest(req: NextRequest, status: number, duration_ms: number): void {
  const log: ApiLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.nextUrl.pathname,
    status,
    duration_ms,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        undefined,
    user_agent: req.headers.get('user-agent') || undefined,
  };

  // Use structured JSON for easy log aggregation
  if (status >= 500) {
    console.error('[monitor]', JSON.stringify(log));
  } else if (status >= 400) {
    console.warn('[monitor]', JSON.stringify(log));
  } else {
    console.log('[monitor]', JSON.stringify(log));
  }
}
