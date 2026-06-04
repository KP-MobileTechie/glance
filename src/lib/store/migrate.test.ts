import { describe, it, expect } from 'vitest';
import { migrateState, defaultState } from './types';

describe('migrateState', () => {
  it('returns a full default state from garbage input', () => {
    expect(migrateState(null).themeId).toBe('dark-neon-dev');
    expect(migrateState(42).widgets).toHaveLength(10);
    expect(migrateState({}).settings.searchEngine).toBe('google');
  });

  it('converts legacy pos to span, ordered by y then x', () => {
    const legacy = {
      widgets: [
        { id: 'a', kind: 'focus', pos: { x: 4, y: 0, w: 4, h: 3 } },
        { id: 'b', kind: 'clock', pos: { x: 0, y: 0, w: 4, h: 3 } },
      ],
      themeId: 'paper-calm', userName: 'K', focus: 'f', todos: [], bookmarks: [], weatherCity: null, updatedAt: 5,
    };
    const s = migrateState(legacy);
    // ordered by y then x: clock (x0) before focus (x4)
    expect(s.widgets[0].kind).toBe('clock');
    expect(s.widgets[1].kind).toBe('focus');
    expect(s.widgets[0].span).toEqual({ w: 4, h: 3 });
    expect(s.widgets.every((w) => typeof w.hidden === 'boolean')).toBe(true);
    // missing kinds are added back (all 10 Phase-5 kinds)
    expect(s.widgets.map((w) => w.kind).sort()).toEqual(['aichat', 'bookmarks', 'clock', 'devTools', 'focus', 'github', 'news', 'pomodoro', 'standup', 'weatherQuote']);
    expect(s.themeId).toBe('paper-calm');
  });

  it('fills missing settings with defaults and keeps provided ones', () => {
    const s = migrateState({ settings: { tempUnit: 'F' } });
    expect(s.settings.tempUnit).toBe('F');
    expect(s.settings.clock24h).toBe(true);
  });

  it('passes a current default state through unchanged in shape', () => {
    const d = defaultState();
    const s = migrateState(d);
    expect(s.widgets).toHaveLength(10);
    expect(s.settings).toEqual(d.settings);
  });

  it('rejects corrupted setting field types and falls back to defaults', () => {
    const s = migrateState({ settings: { clock24h: 'yes', tempUnit: 42, searchEngine: 'altavista' } });
    expect(s.settings.clock24h).toBe(true);
    expect(s.settings.tempUnit).toBe('C');
    expect(s.settings.searchEngine).toBe('google');
  });

  it('deduplicates repeated widget kinds', () => {
    const s = migrateState({
      widgets: [
        { id: 'a', kind: 'clock', pos: { x: 0, y: 0, w: 4, h: 3 } },
        { id: 'b', kind: 'clock', pos: { x: 4, y: 0, w: 4, h: 3 } },
      ],
    });
    expect(s.widgets.filter((w) => w.kind === 'clock')).toHaveLength(1);
    expect(s.widgets).toHaveLength(10);
  });
});
