import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WazuhClient } from "@/lib/wazuh/client";
import { encrypt } from "@/lib/encryption";
import { withMonitoring } from "@/lib/monitor";
import { wazuhConnectionRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { logAdminAction, AUDIT_ACTIONS } from "@/lib/audit-logger";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return { user: null, supabase };
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  return { user, supabase };
}

async function handleGet(request: NextRequest): Promise<NextResponse> {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const { data: connection, error } = await supabase
      .from("wazuh_connections")
      .select("id, name, api_url, api_username, connection_status, last_connected, last_error")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .single();

    if (error || !connection) return NextResponse.json({ connected: false });

    return NextResponse.json({ connected: true, connection });
  } catch (error) {
    console.error("Error getting Wazuh connection:", error);
    return NextResponse.json({ error: "Failed to get connection" }, { status: 500 });
  }
}

async function handlePost(request: NextRequest): Promise<NextResponse> {
  // Rate limit — 5 requests per 60s (connection CRUD is rare, protect from brute-force)
  const ip = getClientIp(request);
  const rateCheck = wazuhConnectionRateLimiter.check(ip);

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before retrying." },
      { status: 429, headers: rateLimitHeaders(rateCheck) }
    );
  }

  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const body = await request.json();
    const { name, api_url, api_username, api_password, _testOnly } = body;

    if (!api_url || !api_username || !api_password) {
      return NextResponse.json({ 
        error: "Missing required fields",
        message: "API URL, username, and password are required" 
      }, { status: 400 });
    }

    const testClient = new WazuhClient({ api_url, api_username, api_password });
    const testResult = await testClient.testConnection();

    const { data: existingConnection } = await supabase
      .from("wazuh_connections")
      .select("id")
      .eq("company_id", company.id)
      .maybeSingle();

    if (!testResult.success) {
      if (!_testOnly) {
        const errorPayload = {
          company_id: company.id,
          name: name || 'My Wazuh',
          api_url,
          api_username,
          api_password_encrypted: encrypt(api_password),
          is_active: true,
          connection_status: 'error',
          last_error: testResult.error,
        };

        if (existingConnection) {
          await supabase.from("wazuh_connections").update(errorPayload).eq("id", existingConnection.id);
        } else {
          await supabase.from("wazuh_connections").insert(errorPayload);
        }
      }

      await logAdminAction({
        action: AUDIT_ACTIONS.WAZUH_CONNECTION_TESTED,
        resource: 'wazuh_connections',
        userId: user.id,
        companyId: company.id,
        details: { api_url, success: false, error: testResult.error },
        req: request,
      });

      return NextResponse.json({ 
        success: false, 
        error: testResult.error,
        message: "Failed to connect. Please check your credentials."
      }, { status: 400 });
    }

    if (_testOnly) {
      return NextResponse.json({
        success: true,
        message: "Connection successful!",
      });
    }

    const successPayload = {
      company_id: company.id,
      name: name || 'My Wazuh',
      api_url,
      api_username,
      api_password_encrypted: encrypt(api_password),
      is_active: true,
      connection_status: 'connected',
      last_connected: new Date().toISOString(),
      last_error: null,
    };

    let connection;
    let upsertError;

    if (existingConnection) {
      const { data, error } = await supabase
        .from("wazuh_connections")
        .update(successPayload)
        .eq("id", existingConnection.id)
        .select()
        .single();
      connection = data;
      upsertError = error;
    } else {
      const { data, error } = await supabase
        .from("wazuh_connections")
        .insert(successPayload)
        .select()
        .single();
      connection = data;
      upsertError = error;
    }

    if (upsertError || !connection) return NextResponse.json({ error: upsertError?.message || "Database error" }, { status: 500 });

    await logAdminAction({
      action: AUDIT_ACTIONS.WAZUH_CONNECTION_CREATED,
      resource: 'wazuh_connections',
      resourceId: connection.id,
      userId: user.id,
      companyId: company.id,
      details: { api_url, name: name || 'My Wazuh', success: true },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      connection: {
        id: connection.id,
        name: connection.name,
        api_url: connection.api_url,
        connection_status: connection.connection_status,
      }
    }, { headers: rateLimitHeaders(rateCheck) });
  } catch (error) {
    console.error("Error saving Wazuh connection:", error);
    return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
  }
}

async function handleDelete(request: NextRequest): Promise<NextResponse> {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const { error } = await supabase
      .from("wazuh_connections")
      .update({ is_active: false })
      .eq("company_id", company.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAdminAction({
      action: AUDIT_ACTIONS.WAZUH_CONNECTION_DELETED,
      resource: 'wazuh_connections',
      userId: user.id,
      companyId: company.id,
      details: {},
      req: request,
    });

    return NextResponse.json({ success: true, message: "Connection removed" });
  } catch (error) {
    console.error("Error deleting Wazuh connection:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}

export const GET = withMonitoring(handleGet);
export const POST = withMonitoring(handlePost);
export const DELETE = withMonitoring(handleDelete);