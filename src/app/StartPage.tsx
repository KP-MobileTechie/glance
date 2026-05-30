'use client';
import { useEffect, useState } from 'react';
import { loadState, updateState } from '@/lib/store/store';
import type { AppState } from '@/lib/store/types';
import { getTheme } from '@/lib/theme/themes';
import { applyTheme } from '@/lib/theme/apply';
import type { Theme } from '@/lib/theme/types';
import { BentoGrid } from '@/components/grid/BentoGrid';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function StartPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);

  useEffect(() => { loadState().then(setState); }, []);

  useEffect(() => {
    if (!state) return;
    applyTheme(customTheme && state.themeId === customTheme.id ? customTheme : getTheme(state.themeId));
  }, [state, customTheme]);

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
      <header className="mb-6 flex items-center justify-end">
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
