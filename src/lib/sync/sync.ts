import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '@/lib/store/types';

const TABLE = 'user_state';

export function mergeStates(local: AppState, remote: AppState | null): AppState {
  if (!remote) return local;
  return remote.updatedAt > local.updatedAt ? remote : local;
}

export async function pullState(client: SupabaseClient, userId: string): Promise<AppState | null> {
  const { data, error } = await client.from(TABLE).select('state').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return (data as { state: AppState }).state;
}

export async function pushState(client: SupabaseClient, userId: string, state: AppState): Promise<void> {
  const { error } = await client.from(TABLE).upsert({ user_id: userId, state, updated_at: new Date(state.updatedAt).toISOString() });
  if (error) throw error;
}

// sanitizeStateForSync is an explicit credential firewall.
// In v2, AppState contains no credentials — secrets live in the IDB 'secrets' store
// and are never in AppState. This function exists as a guaranteed boundary:
// any future AppState field that must not sync to Supabase must be stripped here.
export function sanitizeStateForSync(state: AppState): AppState {
  const sanitized = { ...state };
  // Strip any fields that must never leave the browser:
  // (none in v2 — secrets store handles isolation)
  return sanitized;
}

export async function syncState(client: SupabaseClient, userId: string, local: AppState): Promise<AppState> {
  const remote = await pullState(client, userId);
  const merged = mergeStates(local, remote);
  if (!remote || merged.updatedAt > remote.updatedAt) {
    await pushState(client, userId, sanitizeStateForSync(merged));
  }
  return merged;
}
