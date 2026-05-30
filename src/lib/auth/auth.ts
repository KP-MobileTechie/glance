import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function getUser(client: SupabaseClient | null): Promise<User | null> {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}

export async function signInWithGitHub(client: SupabaseClient | null): Promise<void> {
  if (!client) return;
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  await client.auth.signInWithOAuth({ provider: 'github', options: { redirectTo } });
}

export async function signOut(client: SupabaseClient | null): Promise<void> {
  if (!client) return;
  await client.auth.signOut();
}
