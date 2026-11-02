import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

let supabasePublicClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getPublicSupabaseClient(): SupabaseClient | null {
  if (!config.supabase.url || !config.supabase.anonKey) {
    return null;
  }
  if (!supabasePublicClient) {
    supabasePublicClient = createClient(config.supabase.url, config.supabase.anonKey);
  }
  return supabasePublicClient;
}

export function getAdminSupabaseClient(): SupabaseClient | null {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    return null;
  }
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}

export async function verifySupabaseToken(token: string): Promise<{
  id: string;
  email: string;
  name?: string;
} | null> {
  const client = getAdminSupabaseClient() || getPublicSupabaseClient();
  if (!client) return null;

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email || "",
      name:
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "Stylist",
    };
  } catch (err) {
    console.warn("Token verification error:", err);
    return null;
  }
}
