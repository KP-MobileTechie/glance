import { describe, it, expect } from 'vitest';
import { encodeTheme, decodeTheme } from './share';
import { getTheme } from './themes';

describe('theme share codes', () => {
  it('round-trips a theme through encode then decode', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'custom-1', name: 'My Theme', isBuiltIn: false };
    const code = encodeTheme(theme);
    expect(typeof code).toBe('string');
    expect(code).not.toContain('=');
    const decoded = decodeTheme(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe('My Theme');
    expect(decoded!.colors.accent).toBe(theme.colors.accent);
  });

  it('returns null for a malformed code', () => {
    expect(decodeTheme('not-valid-base64!!')).toBeNull();
    expect(decodeTheme(btoa('{"id":"x"}'))).toBeNull(); // missing required fields
  });
});

describe('decodeTheme CSS allowlist', () => {
  it('returns null when a colour field contains url(javascript:...)', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'x', name: 'x', isBuiltIn: false };
    theme.colors = { ...theme.colors, accent: 'url(javascript:alert(1))' };
    expect(decodeTheme(encodeTheme(theme))).toBeNull();
  });

  it('returns null when a colour field contains expression(...)', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'x', name: 'x', isBuiltIn: false };
    theme.colors = { ...theme.colors, bg: 'expression(alert(1))' };
    expect(decodeTheme(encodeTheme(theme))).toBeNull();
  });

  it('returns null when a colour field contains < or >', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'x', name: 'x', isBuiltIn: false };
    theme.colors = { ...theme.colors, text: '<script>alert(1)</script>' };
    expect(decodeTheme(encodeTheme(theme))).toBeNull();
  });

  it('accepts rgba colours — dark-neon-dev accentGlow uses rgba format', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'x', name: 'x', isBuiltIn: false };
    const code = encodeTheme(theme);
    expect(decodeTheme(code)).not.toBeNull();
  });

  it('accepts all built-in themes without rejection', () => {
    const themeIds = ['dark-neon-dev', 'paper-calm', 'vibrant-glass', 'midnight-ink'];
    for (const id of themeIds) {
      const theme = { ...getTheme(id), id: `copy-${id}`, name: `Copy ${id}`, isBuiltIn: false };
      expect(decodeTheme(encodeTheme(theme))).not.toBeNull();
    }
  });

  it('returns null when radius is an invalid CSS value', () => {
    const theme = { ...getTheme('dark-neon-dev'), id: 'x', name: 'x', isBuiltIn: false, radius: 'not-a-radius' };
    expect(decodeTheme(encodeTheme(theme))).toBeNull();
  });

  it('accepts valid radius values: 12px and 0.5rem', () => {
    const base = getTheme('dark-neon-dev');
    const theme12px = { ...base, id: 'x', name: 'x', isBuiltIn: false, radius: '12px' };
    const theme05rem = { ...base, id: 'y', name: 'y', isBuiltIn: false, radius: '0.5rem' };
    expect(decodeTheme(encodeTheme(theme12px))).not.toBeNull();
    expect(decodeTheme(encodeTheme(theme05rem))).not.toBeNull();
  });
});
