import { describe, it, expect } from 'vitest';
import { buildTheme } from './derive';

describe('buildTheme', () => {
  it('derives surface, border, and glow as rgba of muted/accent', () => {
    const t = buildTheme({
      id: 'custom-x', name: 'X',
      bg: '#000000', text: '#ffffff', muted: '#7dd3fc', accent: '#5eead4',
      font: 'mono', mono: 'mono', radius: '14px',
    });
    expect(t.colors.bg).toBe('#000000');
    expect(t.colors.accent).toBe('#5eead4');
    expect(t.colors.accentGlow).toBe('rgba(94, 234, 212, 0.5)');
    expect(t.colors.border).toBe('rgba(125, 211, 252, 0.18)');
    expect(t.colors.surface).toBe('rgba(125, 211, 252, 0.06)');
    expect(t.isBuiltIn).toBe(false);
  });
  it('keeps a non-hex colour as-is for glow', () => {
    const t = buildTheme({ id: 'x', name: 'X', bg: '#000', text: '#fff', muted: 'teal', accent: 'teal', font: 'm', mono: 'm', radius: '10px' });
    expect(t.colors.accentGlow).toBe('teal');
  });
});
