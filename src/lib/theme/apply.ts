import type { Theme } from './types';

export function themeToVars(theme: Theme): Record<string, string> {
  return {
    '--glance-bg': theme.colors.bg,
    '--glance-surface': theme.colors.surface,
    '--glance-text': theme.colors.text,
    '--glance-muted': theme.colors.muted,
    '--glance-accent': theme.colors.accent,
    '--glance-accent-glow': theme.colors.accentGlow,
    '--glance-border': theme.colors.border,
    '--glance-font': theme.font,
    '--glance-mono': theme.mono,
    '--glance-radius': theme.radius,
  };
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(themeToVars(theme))) {
    root.style.setProperty(key, value);
  }
}
