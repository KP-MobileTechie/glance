'use client';
import { useEffect, useState } from 'react';
import { loadState, updateState } from '@/lib/store/store';
import type { AppState } from '@/lib/store/types';
import { getTheme } from '@/lib/theme/themes';
import { applyTheme } from '@/lib/theme/apply';
import type { Theme } from '@/lib/theme/types';
import { BentoGrid } from '@/components/grid/BentoGrid';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SearchBar } from '@/components/SearchBar';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ThemeCreator } from '@/components/ThemeCreator';
import { useAuth } from '@/lib/auth/useAuth';
import { getSupabase } from '@/lib/supabase/client';
import { syncState } from '@/lib/sync/sync';
import { AuthButton } from '@/components/AuthButton';
import Link from 'next/link';
import { publishTheme } from '@/lib/gallery/gallery';
import { IconLogo } from '@/components/icons/icons';
import { useIsMobile } from '@/lib/useMediaQuery';

export default function StartPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const isMobile = useIsMobile();

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }
  const auth = useAuth();

  useEffect(() => { loadState().then(setState); }, []);

  useEffect(() => {
    if (!state) return;
    applyTheme(getTheme(state.themeId, state.customThemes));
  }, [state]);

  useEffect(() => {
    const client = getSupabase();
    if (!client || !auth.user || !state) return;
    let cancelled = false;
    syncState(client, auth.user.id, state).then((merged) => { if (!cancelled) setState(merged); }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (settingsOpen) setSettingsOpen(false);
      if (creatorOpen) setCreatorOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen, creatorOpen]);

  function handleSignIn() {
    setAuthPending(true);
    auth.signIn();
  }

  async function patch(p: Partial<AppState>) {
    const next = await updateState(p);
    setState(next);
  }

  function selectTheme(id: string) { patch({ themeId: id }); }

  function importTheme(theme: Theme) {
    setState((s) => (s ? { ...s, customThemes: upsertTheme(s.customThemes, theme) } : s));
    patch({ themeId: theme.id, customThemes: upsertTheme(state?.customThemes ?? [], theme) });
  }

  function saveTheme(theme: Theme) {
    patch({ customThemes: upsertTheme(state?.customThemes ?? [], theme) });
  }
  function applyCreated(theme: Theme) {
    patch({ themeId: theme.id, customThemes: upsertTheme(state?.customThemes ?? [], theme) });
    setCreatorOpen(false);
  }
  function deleteCustom(id: string) {
    const next = (state?.customThemes ?? []).filter((t) => t.id !== id);
    patch({ customThemes: next, themeId: state?.themeId === id ? 'dark-neon-dev' : state?.themeId ?? 'dark-neon-dev' });
  }
  async function publishWithFeedback(theme: Theme) {
    const client = getSupabase();
    if (!client || !auth.user) { showToast('Sign in with GitHub to publish'); return; }
    try {
      await publishTheme(client, auth.user.id, theme);
      showToast('Published to the gallery');
    } catch {
      showToast('Could not publish theme');
    }
  }
  function handlePublish() {
    if (!state) return;
    publishWithFeedback(getTheme(state.themeId, state.customThemes));
  }

  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8" aria-busy="true" aria-label="Loading Glance">
        <div className="mb-8 flex items-center justify-between">
          <div className="glance-skeleton" style={{ width: '7rem', height: '1.6rem' }} />
          <div className="glance-skeleton" style={{ width: '6rem', height: '1.9rem' }} />
        </div>
        <div className="glance-skeleton mx-auto mb-8 w-full max-w-2xl" style={{ height: '3rem' }} />
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
      <header className="relative z-10 mb-8 flex flex-wrap items-center justify-between gap-3">
        <span className="glance-wordmark text-lg">
          <span className="glance-logo"><IconLogo /></span>
          glance
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/gallery" className="glance-nav">gallery</Link>
          <AuthButton enabled={auth.enabled} user={auth.user} isPending={authPending} onSignIn={handleSignIn} onSignOut={auth.signOut} />
          <button className="glance-chip" aria-label="settings" onClick={() => setSettingsOpen(true)}>settings</button>
          <ThemeSwitcher
            activeId={state.themeId}
            customThemes={state.customThemes}
            onSelect={selectTheme}
            onImport={importTheme}
            onCreate={() => setCreatorOpen(true)}
            onDeleteCustom={deleteCustom}
            onPublish={auth.user ? handlePublish : undefined}
          />
        </div>
      </header>

      <div className="mb-8">
        <SearchBar engine={state.settings.searchEngine} />
      </div>

      <div className="flex flex-1 items-start">
        <div className="w-full">
          <BentoGrid
            state={state}
            onChange={patch}
            onLayoutChange={(widgets) => patch({ widgets })}
            mobile={isMobile}
          />
        </div>
      </div>

      <SettingsPanel
        open={settingsOpen}
        settings={state.settings}
        userName={state.userName}
        weatherCity={state.weatherCity}
        widgets={state.widgets}
        onClose={() => setSettingsOpen(false)}
        onChange={patch}
      />
      <ThemeCreator
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        onSave={saveTheme}
        onApply={applyCreated}
        onPublish={auth.user ? (t) => publishWithFeedback(t) : undefined}
      />
      {toast && <div className="glance-toast" role="status">{toast}</div>}
    </main>
  );
}

function upsertTheme(list: Theme[], theme: Theme): Theme[] {
  const without = list.filter((t) => t.id !== theme.id);
  return [...without, theme];
}
