'use client';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { buildTheme } from '@/lib/theme/derive';
import { themeToVars } from '@/lib/theme/apply';
import { encodeTheme } from '@/lib/theme/share';
import type { Theme } from '@/lib/theme/types';

const SANS = "'Sora', ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export interface ThemeCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (theme: Theme) => void;
  onApply: (theme: Theme) => void;
  onPublish?: (theme: Theme) => void;
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// One row: a visible, editable hex code plus a colour picker, both bound to
// the same value so you always see exactly which colour code is in use.
function ColorRow({ label, value, onChange }: ColorRowProps) {
  const validHex = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="glance-field-row">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          aria-label={`${label} hex`}
          className="glance-field"
          style={{ width: '6.5rem', fontFamily: 'var(--glance-mono)', textTransform: 'lowercase' }}
          value={value}
          spellCheck={false}
          maxLength={7}
          placeholder="#rrggbb"
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="color"
          aria-label={`${label} colour`}
          value={validHex ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    </div>
  );
}

export function ThemeCreator({ open, onClose, onSave, onApply, onPublish }: ThemeCreatorProps) {
  const [name, setName] = useState('My theme');
  const [bg, setBg] = useState('#07080d');
  const [text, setText] = useState('#e8f7ff');
  const [muted, setMuted] = useState('#7dd3fc');
  const [accent, setAccent] = useState('#5eead4');
  const [isMono, setIsMono] = useState(true);
  const [radius, setRadius] = useState(14);
  const [id, setId] = useState('');
  // stable-but-unique id: a fresh one each time the creator opens
  useEffect(() => { if (open) setId('custom-' + crypto.randomUUID().slice(0, 8)); }, [open]);
  if (!open) return null;

  function compose(): Theme {
    return buildTheme({
      id: id || 'custom-' + (name.trim().toLowerCase().replace(/\s+/g, '-') || 'theme'),
      name: name.trim() || 'My theme',
      bg, text, muted, accent,
      font: isMono ? MONO : SANS,
      mono: MONO,
      radius: `${radius}px`,
    });
  }
  const vars = themeToVars(compose()) as CSSProperties;

  return (
    <div className="glance-overlay" onClick={onClose}>
      <div className="glance-sheet glance-sheet-wide" role="dialog" aria-label="theme creator" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="glance-label">create theme</h2>
          <button className="glance-chip" aria-label="close theme creator" onClick={onClose}>close</button>
        </div>

        <div className="glance-creator">
          <div className="glance-creator-preview" style={vars}>
            <div style={{ fontFamily: 'var(--glance-mono)', color: 'var(--glance-accent)', fontSize: '2rem', textShadow: '0 0 18px var(--glance-accent-glow)' }}>23:04</div>
            <div className="glance-tile p-4" style={{ marginTop: '0.8rem' }}>
              <span style={{ color: 'var(--glance-muted)' }}>preview tile</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="glance-field-row">name
              <input className="glance-field" aria-label="theme name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <ColorRow label="background" value={bg} onChange={setBg} />
            <ColorRow label="text" value={text} onChange={setText} />
            <ColorRow label="muted" value={muted} onChange={setMuted} />
            <ColorRow label="accent" value={accent} onChange={setAccent} />
            <label className="glance-field-row">font
              <select className="glance-field" aria-label="font" value={isMono ? 'mono' : 'sans'} onChange={(e) => setIsMono(e.target.value === 'mono')}>
                <option value="mono">Mono</option>
                <option value="sans">Sans</option>
              </select>
            </label>
            <label className="glance-field-row">corner radius
              <input type="range" min={8} max={22} aria-label="corner radius" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="glance-btn-primary text-sm" onClick={() => onApply(compose())}>apply</button>
              <button className="glance-chip" onClick={() => onSave(compose())}>save to my themes</button>
              {onPublish && <button className="glance-chip" onClick={() => onPublish(compose())}>publish</button>}
              <button className="glance-chip" onClick={() => navigator.clipboard?.writeText(encodeTheme(compose()))}>copy share code</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
