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
import { publishTheme } from '@/lib/gallery/gallery';
import { IconLogo } from '@/components/icons/icons';

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

  const activeTheme = customTheme && state && state.themeId === customTheme.id ? customTheme : (state ? getTheme(state.themeId) : null);

  function handlePublish() {
    const client = getSupabase();
    if (!client || !auth.user || !activeTheme) return;
    publishTheme(client, auth.user.id, activeTheme).catch(() => {});
  }

  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8" aria-busy="true" aria-label="Loading Glance">
        <div className="mb-8 flex items-center justify-between">
          <div className="glance-skeleton" style={{ width: '7rem', height: '1.6rem' }} />
          <div className="glance-skeleton" style={{ width: '6rem', height: '1.9rem' }} />
        </div>
        <div className="flex flex-1 items-center">
          <div className="grid w-full gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gridAutoRows: '84px' }}>
            <div className="glance-skeleton" style={{ gridColumn: '1 / span 4', gridRow: '1 / span 3' }} />
            <div className="glance-skeleton" style={{ gridColumn: '5 / span 4', gridRow: '1 / span 3' }} />
            <div className="glance-skeleton" style={{ gridColumn: '1 / span 4', gridRow: '4 / span 2' }} />
            <div className="glance-skeleton" style={{ gridColumn: '5 / span 4', gridRow: '4 / span 2' }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
      <header className="relative z-10 mb-8 flex items-center justify-between gap-3">
        <span className="glance-wordmark text-lg">
          <span className="glance-logo"><IconLogo /></span>
          glance
        </span>
        <div className="flex items-center gap-3">
          <Link href="/gallery" className="glance-nav">gallery</Link>
          <AuthButton enabled={auth.enabled} user={auth.user} onSignIn={auth.signIn} onSignOut={auth.signOut} />
          <ThemeSwitcher
            activeId={state.themeId}
            onSelect={(id) => patch({ themeId: id })}
            onImport={importTheme}
            onPublish={auth.user ? handlePublish : undefined}
          />
        </div>
      </header>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <BentoGrid
            state={state}
            onChange={patch}
            onLayoutChange={(widgets) => patch({ widgets })}
          />
        </div>
      </div>
    </main>
  );
}
