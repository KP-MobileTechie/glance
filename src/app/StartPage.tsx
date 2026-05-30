'use client';
import { useEffect, useState } from 'react';
import { loadState, updateState } from '@/lib/store/store';
import type { AppState } from '@/lib/store/types';
import { getTheme } from '@/lib/theme/themes';
import { applyTheme } from '@/lib/theme/apply';
import type { Theme } from '@/lib/theme/types';
import { BentoGrid } from '@/components/grid/BentoGrid';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/lib/auth/useAuth';
import { getSupabase } from '@/lib/supabase/client';
import { syncState } from '@/lib/sync/sync';
import { AuthButton } from '@/components/AuthButton';
import Link from 'next/link';

export default function StartPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);

  useEffect(() => { loadState().then(setState); }, []);

  useEffect(() => {
    if (!state) return;
    applyTheme(customTheme && state.themeId === customTheme.id ? customTheme : getTheme(state.themeId));
  }, [state, customTheme]);

  const auth = useAuth();

  useEffect(() => {
    const client = getSupabase();
    if (!client || !auth.user || !state) return;
    let cancelled = false;
    syncState(client, auth.user.id, state).then((merged) => {
      if (!cancelled) setState(merged);
    }).catch(() => {});
    return () => { cancelled = true; };
    // Sync when the user signs in. Intentionally not depending on `state` to avoid a push loop on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  async function patch(p: Partial<AppState>) {
    const next = await updateState(p);
    setState(next);
  }

  function importTheme(theme: Theme) {
    setCustomTheme(theme);
    patch({ themeId: theme.id });
  }

  if (!state) return <main className="min-h-screen" />;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="relative z-10 mb-6 flex items-center justify-end gap-3">
        <Link href="/gallery" className="text-sm" style={{ color: 'var(--glance-muted)' }}>gallery</Link>
        <AuthButton enabled={auth.enabled} user={auth.user} onSignIn={auth.signIn} onSignOut={auth.signOut} />
        <ThemeSwitcher activeId={state.themeId} onSelect={(id) => patch({ themeId: id })} onImport={importTheme} />
      </header>
      <BentoGrid
        state={state}
        onChange={patch}
        onLayoutChange={(widgets) => patch({ widgets })}
      />
    </main>
  );
}
