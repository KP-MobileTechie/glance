import { describe, it, expect } from 'vitest';
import { themeToVars, applyTheme } from './apply';
import { getTheme } from './themes';

describe('themeToVars', () => {
  it('maps every color to a --glance- CSS variable', () => {
    const vars = themeToVars(getTheme('dark-neon-dev'));
    expect(vars['--glance-bg']).toBe('#07080d');
    expect(vars['--glance-accent']).toBe('#5eead4');
    expect(vars['--glance-font']).toContain('monospace');
    expect(vars['--glance-radius']).toBe('14px');
  });
});

describe('applyTheme', () => {
  it('writes the variables onto the document root', () => {
    applyTheme(getTheme('paper-calm'));
    expect(document.documentElement.style.getPropertyValue('--glance-bg')).toBe('#f4f1ec');
  });
});
