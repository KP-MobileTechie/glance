import type { Theme } from './types';

export interface ThemeInput {
  id: string;
  name: string;
  bg: string;
  text: string;
  muted: string;
  accent: string;
  font: string;
  mono: string;
  radius: string;
}

function rgba(color: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return color;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildTheme(input: ThemeInput): Theme {
  return {
    id: input.id,
    name: input.name,
    isBuiltIn: false,
    colors: {
      bg: input.bg,
      text: input.text,
      muted: input.muted,
      accent: input.accent,
      surface: rgba(input.muted, 0.06),
      border: rgba(input.muted, 0.18),
      accentGlow: rgba(input.accent, 0.5),
    },
    font: input.font,
    mono: input.mono,
    radius: input.radius,
  };
}
