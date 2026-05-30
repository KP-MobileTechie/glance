import type { Theme, ThemeColors } from './types';

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'bg', 'surface', 'text', 'muted', 'accent', 'accentGlow', 'border',
];

function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeTheme(theme: Theme): string {
  return toBase64Url(JSON.stringify(theme));
}

function isValidTheme(value: unknown): value is Theme {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  if (typeof t.id !== 'string' || typeof t.name !== 'string') return false;
  if (typeof t.font !== 'string' || typeof t.mono !== 'string' || typeof t.radius !== 'string') return false;
  if (typeof t.colors !== 'object' || t.colors === null) return false;
  const colors = t.colors as Record<string, unknown>;
  return COLOR_KEYS.every((k) => typeof colors[k] === 'string');
}

export function decodeTheme(code: string): Theme | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code));
    return isValidTheme(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
