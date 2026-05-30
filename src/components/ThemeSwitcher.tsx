'use client';
import { useState } from 'react';
import { BUILT_IN_THEMES } from '@/lib/theme/themes';
import { decodeTheme } from '@/lib/theme/share';
import type { Theme } from '@/lib/theme/types';
import { IconPalette } from '@/components/icons/icons';

export interface ThemeSwitcherProps {
  activeId: string;
  onSelect: (id: string) => void;
  onImport: (theme: Theme) => void;
  onPublish?: () => void;
}

export function ThemeSwitcher({ activeId, onSelect, onImport, onPublish }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function importCode() {
    const theme = decodeTheme(code.trim());
    if (!theme) { setError('That share code did not work'); return; }
    setError(''); setCode(''); onImport(theme);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="themes"
        className="flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
        style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }}>
        <IconPalette /> themes
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border p-3 z-50"
          style={{ background: 'var(--glance-bg)', borderColor: 'var(--glance-border)' }}>
          <div className="flex flex-col gap-1">
            {BUILT_IN_THEMES.map((t) => (
              <button key={t.id} onClick={() => onSelect(t.id)}
                className="rounded px-2 py-1 text-left text-sm"
                style={{ color: 'var(--glance-text)', fontWeight: t.id === activeId ? 700 : 400 }}>
                {t.name}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--glance-border)' }}>
            <input placeholder="paste a share code" value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full rounded border bg-transparent px-2 py-1 text-xs"
              style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }} />
            <button onClick={importCode} className="mt-2 w-full rounded px-2 py-1 text-xs"
              style={{ background: 'var(--glance-accent)', color: 'var(--glance-bg)' }}>import theme</button>
            {error && <p className="mt-1 text-xs" style={{ color: '#f87171' }}>{error}</p>}
            {onPublish && (
              <button onClick={onPublish} className="mt-2 w-full rounded border px-2 py-1 text-xs"
                style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }}>
                publish current theme to gallery
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
