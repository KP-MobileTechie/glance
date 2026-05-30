import { describe, it, expect } from 'vitest';
import { BUILT_IN_THEMES, DEFAULT_THEME_ID, getTheme } from './themes';

describe('built-in themes', () => {
  it('includes the dark-neon-dev default', () => {
    expect(DEFAULT_THEME_ID).toBe('dark-neon-dev');
    expect(getTheme('dark-neon-dev')?.name).toMatch(/neon/i);
  });

  it('ships at least four themes, each with required color keys', () => {
    expect(BUILT_IN_THEMES.length).toBeGreaterThanOrEqual(4);
    for (const t of BUILT_IN_THEMES) {
      for (const key of ['bg', 'surface', 'text', 'muted', 'accent', 'accentGlow', 'border']) {
        expect(t.colors).toHaveProperty(key);
      }
    }
  });

  it('falls back to the default theme for an unknown id', () => {
    expect(getTheme('does-not-exist')?.id).toBe('dark-neon-dev');
  });
});
