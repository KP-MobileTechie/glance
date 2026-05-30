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
