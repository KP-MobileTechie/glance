import type { SupabaseClient } from '@supabase/supabase-js';
import type { Theme } from '@/lib/theme/types';

const TABLE = 'themes';

export interface GalleryTheme {
  id: string;
  name: string;
  theme: Theme;
  use_count: number;
}

export async function listPublicThemes(client: SupabaseClient): Promise<GalleryTheme[]> {
  const { data, error } = await client
    .from(TABLE)
    .select('id,name,theme,use_count')
    .eq('is_public', true)
    .order('use_count', { ascending: false });
  if (error || !data) return [];
  return data as GalleryTheme[];
}

export async function publishTheme(client: SupabaseClient, userId: string, theme: Theme): Promise<void> {
  await client.from(TABLE).insert({
    author_id: userId,
    name: theme.name,
    theme,
    is_public: true,
    use_count: 0,
  });
}

export async function incrementUseCount(client: SupabaseClient, themeId: string): Promise<void> {
  await client.rpc('increment_theme_use', { theme_id: themeId });
}
