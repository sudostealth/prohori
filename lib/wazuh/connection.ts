import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WazuhClient, WazuhCredentials } from './client';

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

interface WazuhConnection {
  id: string;
  company_id: string;
  name: string;
  api_url: string;
  api_username: string;
  api_password_encrypted: string;
  is_active: boolean;
  connection_status: string;
  last_error: string | null;
  last_connected: string | null;
}

const ENCRYPTION_KEY = process.env.WAZUH_ENCRYPTION_KEY || 'prohori-default-encryption-key-change-me';

function simpleEncrypt(text: string): string {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result, 'binary').toString('base64');
}

function simpleDecrypt(encrypted: string): string {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  const decoded = Buffer.from(encrypted, 'base64').toString('binary');
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

export async function getWazuhConnection(companyId: string): Promise<WazuhConnection | null> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('wazuh_connections')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as WazuhConnection;
}

export async function createWazuhConnection(
  companyId: string,
  credentials: { api_url: string; api_username: string; api_password: string },
  name: string = 'My Wazuh'
): Promise<{ success: boolean; connection?: WazuhConnection; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  const encryptedPassword = simpleEncrypt(credentials.api_password);

  const { data, error } = await supabase
    .from('wazuh_connections')
    .insert({
      company_id: companyId,
      name,
      api_url: credentials.api_url,
      api_username: credentials.api_username,
      api_password_encrypted: encryptedPassword,
      is_active: true,
      connection_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, connection: data as WazuhConnection };
}

export async function updateWazuhConnection(
  connectionId: string,
  credentials: { api_url?: string; api_username?: string; api_password?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  const updateData: Record<string, string> = {};
  
  if (credentials.api_url) updateData.api_url = credentials.api_url;
  if (credentials.api_username) updateData.api_username = credentials.api_username;
  if (credentials.api_password) {
    updateData.api_password_encrypted = simpleEncrypt(credentials.api_password);
  }

  const { error } = await supabase
    .from('wazuh_connections')
    .update(updateData)
    .eq('id', connectionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteWazuhConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('wazuh_connections')
    .delete()
    .eq('id', connectionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function testWazuhConnection(companyId: string): Promise<{ success: boolean; error?: string }> {
  const connection = await getWazuhConnection(companyId);
  
  if (!connection) {
    return { success: false, error: 'No Wazuh connection found' };
  }

  const credentials: WazuhCredentials = {
    api_url: connection.api_url,
    api_username: connection.api_username,
    api_password: simpleDecrypt(connection.api_password_encrypted),
  };

  const client = new WazuhClient(credentials);
  const result = await client.testConnection();

  const supabase = getSupabaseAdmin();
  await supabase
    .from('wazuh_connections')
    .update({
      connection_status: result.success ? 'connected' : 'error',
      last_connected: result.success ? new Date().toISOString() : null,
      last_error: result.error || null,
    })
    .eq('id', connection.id);

  return result;
}

export function getWazuhClient(companyId: string): Promise<WazuhClient | null> {
  return getWazuhClientWithCredentials(companyId);
}

export async function getWazuhClientWithCredentials(companyId: string): Promise<WazuhClient | null> {
  const connection = await getWazuhConnection(companyId);
  
  if (!connection) {
    return null;
  }

  const credentials: WazuhCredentials = {
    api_url: connection.api_url,
    api_username: connection.api_username,
    api_password: simpleDecrypt(connection.api_password_encrypted),
  };

  return new WazuhClient(credentials);
}

export function encryptPassword(password: string): string {
  return simpleEncrypt(password);
}

export function decryptPassword(encrypted: string): string {
  return simpleDecrypt(encrypted);
}
