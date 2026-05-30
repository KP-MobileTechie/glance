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
      <button onClick={() => setOpen((o) => !o)} aria-label="themes" className="glance-chip">
        <IconPalette /> themes
      </button>
      {open && (
        <div className="glance-popover absolute right-0 mt-2 w-64 rounded-xl p-3 z-50">
          <div className="flex flex-col gap-0.5">
            {BUILT_IN_THEMES.map((t) => (
              <button key={t.id} onClick={() => onSelect(t.id)} className="glance-theme-row"
                style={{ fontWeight: t.id === activeId ? 700 : 400 }}>
                <span className="glance-swatch" style={{ background: t.colors.bg, boxShadow: `inset 0 0 0 3px ${t.colors.accent}` }} />
                {t.name}
                {t.id === activeId && <span className="ml-auto text-xs" style={{ color: 'var(--glance-accent)' }}>active</span>}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--glance-border)' }}>
            <input placeholder="paste a share code" value={code} onChange={(e) => setCode(e.target.value)} className="glance-field w-full" />
            <button onClick={importCode} className="glance-btn-primary mt-2 w-full text-xs">import theme</button>
            {error && <p className="mt-1 text-xs" style={{ color: '#f87171' }}>{error}</p>}
            {onPublish && (
              <button onClick={onPublish} className="glance-chip mt-2 w-full justify-center text-xs">
                publish current theme to gallery
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
