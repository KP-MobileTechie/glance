import type { Theme } from './types';

const SANS = "'Sora', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', 'Fira Code', monospace";

export const DEFAULT_THEME_ID = 'dark-neon-dev';

export const BUILT_IN_THEMES: Theme[] = [
  {
    id: 'dark-neon-dev',
    name: 'Dark Neon Dev',
    isBuiltIn: true,
    colors: {
      bg: '#07080d', surface: 'rgba(125,211,252,0.04)', text: '#e8f7ff',
      muted: '#7dd3fc', accent: '#5eead4', accentGlow: 'rgba(94,234,212,0.55)',
      border: 'rgba(125,211,252,0.18)',
    },
    font: MONO, mono: MONO, radius: '14px',
  },
  {
    id: 'paper-calm',
    name: 'Paper Calm',
    isBuiltIn: true,
    colors: {
      bg: '#f4f1ec', surface: '#ffffff', text: '#2b2926', muted: '#8a8478',
      accent: '#b08968', accentGlow: 'rgba(176,137,104,0.0)', border: '#e0dad0',
    },
    font: SANS, mono: MONO, radius: '16px',
  },
  {
    id: 'vibrant-glass',
    name: 'Vibrant Glass',
    isBuiltIn: true,
    colors: {
      bg: '#5b3cc4', surface: 'rgba(255,255,255,0.15)', text: '#ffffff',
      muted: 'rgba(255,255,255,0.8)', accent: '#ff8a4c', accentGlow: 'rgba(255,138,76,0.4)',
      border: 'rgba(255,255,255,0.3)',
    },
    font: SANS, mono: MONO, radius: '18px',
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink',
    isBuiltIn: true,
    colors: {
      bg: '#0f172a', surface: 'rgba(148,163,184,0.06)', text: '#e2e8f0',
      muted: '#94a3b8', accent: '#818cf8', accentGlow: 'rgba(129,140,248,0.45)',
      border: 'rgba(148,163,184,0.18)',
    },
    font: SANS, mono: MONO, radius: '14px',
  },
];

export function getTheme(id: string): Theme {
  return (
    BUILT_IN_THEMES.find((t) => t.id === id) ??
    BUILT_IN_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!
  );
}
