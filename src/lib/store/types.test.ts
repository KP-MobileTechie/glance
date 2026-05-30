import { describe, it, expect } from 'vitest';
import { defaultState, WIDGET_KINDS } from './types';

describe('defaultState', () => {
  it('creates one widget instance per kind with unique ids', () => {
    const s = defaultState();
    expect(s.widgets).toHaveLength(WIDGET_KINDS.length);
    const kinds = s.widgets.map((w) => w.kind).sort();
    expect(kinds).toEqual([...WIDGET_KINDS].sort());
    const ids = new Set(s.widgets.map((w) => w.id));
    expect(ids.size).toBe(s.widgets.length);
  });

  it('defaults to the dark-neon-dev theme and empty user data', () => {
    const s = defaultState();
    expect(s.themeId).toBe('dark-neon-dev');
    expect(s.todos).toEqual([]);
    expect(s.bookmarks).toEqual([]);
    expect(s.focus).toBe('');
    expect(typeof s.updatedAt).toBe('number');
  });
});
