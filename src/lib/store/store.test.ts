import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState, updateState } from './store';
import { defaultState } from './types';
import { getDB, resetDB } from './db';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';

beforeEach(async () => {
  // Replace the global indexedDB with a fresh in-memory instance so each
  // test starts from a completely clean slate without leftover connections.
  (globalThis as Record<string, unknown>).indexedDB = new FDBFactory();
  resetDB();
});

describe('store', () => {
  it('returns default state when nothing is stored', async () => {
    const s = await loadState();
    expect(s.themeId).toBe('dark-neon-dev');
    expect(s.widgets).toHaveLength(8);
  });

  it('round-trips a saved state', async () => {
    const s = defaultState();
    s.userName = 'Krunal';
    s.focus = 'ship the grid';
    await saveState(s);
    const loaded = await loadState();
    expect(loaded.userName).toBe('Krunal');
    expect(loaded.focus).toBe('ship the grid');
  });

  it('updateState merges a patch and bumps updatedAt', async () => {
    await saveState(defaultState());
    const next = await updateState({ userName: 'Krunal' });
    expect(next.userName).toBe('Krunal');
    expect(next.updatedAt).toBeGreaterThan(0);
  });

  it('IDB v2 schema creates both app and secrets object stores', async () => {
    const db = await getDB();
    expect(db.objectStoreNames.contains('app')).toBe(true);
    expect(db.objectStoreNames.contains('secrets')).toBe(true);
  });
});
