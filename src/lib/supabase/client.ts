import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function url(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}
function anonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url() && anonKey());
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url()!, anonKey()!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
