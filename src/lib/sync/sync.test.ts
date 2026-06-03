import { describe, it, expect, vi } from 'vitest';
import { mergeStates, syncState, sanitizeStateForSync } from './sync';
import { defaultState } from '@/lib/store/types';

describe('mergeStates', () => {
  it('returns the state with the newer updatedAt', () => {
    const older = { ...defaultState(), userName: 'old', updatedAt: 100 };
    const newer = { ...defaultState(), userName: 'new', updatedAt: 200 };
    expect(mergeStates(older, newer).userName).toBe('new');
    expect(mergeStates(newer, older).userName).toBe('new');
  });

  it('returns local when remote is null', () => {
    const local = { ...defaultState(), updatedAt: 5 };
    expect(mergeStates(local, null)).toBe(local);
  });
});

describe('sanitizeStateForSync', () => {
  it('returns a copy of state, not the same object reference', () => {
    const state = defaultState();
    const result = sanitizeStateForSync(state);
    expect(result).not.toBe(state);
    expect(result).toEqual(state);
  });
});

describe('syncState', () => {
  it('pushes local when it is newer than remote, returns merged', async () => {
    const local = { ...defaultState(), userName: 'local', updatedAt: 300 };
    const remoteRow = { state: { ...defaultState(), userName: 'remote', updatedAt: 100 } };
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: remoteRow, error: null }) })) })),
        upsert,
      })),
    };
    const merged = await syncState(client as never, 'user-1', local);
    expect(merged.userName).toBe('local');
    expect(upsert).toHaveBeenCalled();
    // Verify the argument passed to upsert is the sanitized copy (equal content, could be different ref)
    const upsertArg = upsert.mock.calls[0][0];
    expect(upsertArg.state).toEqual(local);
  });

  it('does not push when remote is newer, returns remote', async () => {
    const local = { ...defaultState(), userName: 'local', updatedAt: 100 };
    const remoteRow = { state: { ...defaultState(), userName: 'remote', updatedAt: 500 } };
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: remoteRow, error: null }) })) })),
        upsert,
      })),
    };
    const merged = await syncState(client as never, 'user-1', local);
    expect(merged.userName).toBe('remote');
    expect(upsert).not.toHaveBeenCalled();
  });
});
