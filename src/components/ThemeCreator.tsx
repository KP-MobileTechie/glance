'use client';
import { useEffect, useRef, useState } from 'react';
import { buildTheme } from '@/lib/theme/derive';
import { themeToVars } from '@/lib/theme/apply';
import { encodeTheme } from '@/lib/theme/share';
import type { Theme } from '@/lib/theme/types';
import type { CSSProperties } from 'react';

const SANS = "'Sora', ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export interface ThemeCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (theme: Theme) => void;
  onApply: (theme: Theme) => void;
  onPublish?: (theme: Theme) => void;
}

export function ThemeCreator({ open, onClose, onSave, onApply, onPublish }: ThemeCreatorProps) {
  const [name, setName] = useState('My theme');
  const [isMono, setIsMono] = useState(true);
  const [radius, setRadius] = useState(14);
  // Use refs for color values so uncontrolled inputs + native events work in tests
  const bgRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const mutedRef = useRef<HTMLInputElement>(null);
  const accentRef = useRef<HTMLInputElement>(null);
  // preview counter to trigger re-render when color changes
  const [, setTick] = useState(0);
  // stable-but-unique id: reset once each time the creator opens
  const idRef = useRef('');
  useEffect(() => { if (open) idRef.current = 'custom-' + crypto.randomUUID().slice(0, 8); }, [open]);
  if (!open) return null;

  function readColors() {
    return {
      bg: bgRef.current?.value ?? '#07080d',
      text: textRef.current?.value ?? '#e8f7ff',
      muted: mutedRef.current?.value ?? '#7dd3fc',
      accent: accentRef.current?.value ?? '#5eead4',
    };
  }

  function compose(): Theme {
    const colors = readColors();
    return buildTheme({
      id: idRef.current || ('custom-' + name.trim().toLowerCase().replace(/\s+/g, '-') || 'custom'),
      name: name.trim() || 'My theme',
      ...colors,
      font: isMono ? MONO : SANS, mono: MONO, radius: `${radius}px`,
    });
  }

  function handleColorChange() {
    setTick((t) => t + 1);
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
            <label className="glance-field-row">background
              <input type="color" aria-label="background colour" ref={bgRef} defaultValue="#07080d"
                onChange={handleColorChange} onInput={handleColorChange} />
            </label>
            <label className="glance-field-row">text
              <input type="color" aria-label="text colour" ref={textRef} defaultValue="#e8f7ff"
                onChange={handleColorChange} onInput={handleColorChange} />
            </label>
            <label className="glance-field-row">muted
              <input type="color" aria-label="muted colour" ref={mutedRef} defaultValue="#7dd3fc"
                onChange={handleColorChange} onInput={handleColorChange} />
            </label>
            <label className="glance-field-row">accent
              <input type="color" aria-label="accent colour" ref={accentRef} defaultValue="#5eead4"
                onChange={handleColorChange} onInput={handleColorChange} />
            </label>
            <label className="glance-field-row">font
              <select className="glance-field" aria-label="font" value={isMono ? 'mono' : 'sans'} onChange={(e) => setIsMono(e.target.value === 'mono')}>
                <option value="mono">Mono</option>
                <option value="sans">Sans</option>
              </select>
            </label>
            <label className="glance-field-row">corner radius
              <input type="range" min={8} max={22} aria-label="corner radius" value={radius} onChange={(e) => { setRadius(Number(e.target.value)); }} />
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
