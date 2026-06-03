import type { Theme, ThemeColors } from './types';

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'bg', 'surface', 'text', 'muted', 'accent', 'accentGlow', 'border',
];

// CSS value allowlist — FOUND-07: strict patterns for theme colour/radius fields
const HEX_COLOR = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
const RGBA_COLOR = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*[\d.]+)?\s*\)$/;
const CSS_RADIUS = /^\d+(\.\d+)?(px|rem|em|%)$/;
const DANGEROUS_CSS = /(javascript:|expression\(|url\(|<|>)/i;

function isSafeColorValue(v: string): boolean {
  return (HEX_COLOR.test(v) || RGBA_COLOR.test(v)) && !DANGEROUS_CSS.test(v);
}

function isSafeFontValue(v: string): boolean {
  return v.length > 0 && v.length < 200 && !DANGEROUS_CSS.test(v);
}

function isSafeRadius(v: string): boolean {
  return CSS_RADIUS.test(v);
}

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
  return (
    COLOR_KEYS.every((k) => typeof colors[k] === 'string' && isSafeColorValue(colors[k] as string)) &&
    isSafeFontValue(t.font as string) &&
    isSafeFontValue(t.mono as string) &&
    isSafeRadius(t.radius as string)
  );
}

export function decodeTheme(code: string): Theme | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code));
    return isValidTheme(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
