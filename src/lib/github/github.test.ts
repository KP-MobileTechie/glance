import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchYesterdayCommits } from './github';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchYesterdayCommits', () => {
  it('T-AIFT-02a: returns only commits from target date events', async () => {
    const targetDate = '2026-06-03';
    const mockEvents = [
      {
        type: 'PushEvent',
        created_at: '2026-06-03T10:00:00Z',
        payload: { commits: [{ message: 'fix: login bug' }, { message: 'feat: add button' }] },
      },
      {
        type: 'PushEvent',
        created_at: '2026-06-03T15:30:00Z',
        payload: { commits: [{ message: 'chore: update deps' }] },
      },
      {
        type: 'PushEvent',
        created_at: '2026-06-02T09:00:00Z', // different date — should be excluded
        payload: { commits: [{ message: 'docs: update readme' }] },
      },
      {
        type: 'WatchEvent',
        created_at: '2026-06-03T12:00:00Z', // not a PushEvent — should be excluded
        payload: {},
      },
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEvents,
    }));

    const result = await fetchYesterdayCommits('octocat', 'ghp_token', targetDate);
    expect(result).toEqual(['fix: login bug', 'feat: add button', 'chore: update deps']);
  });

  it('T-AIFT-02b: returns [] when fetch returns non-ok response (status 403)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    }));

    const result = await fetchYesterdayCommits('octocat', 'bad_token', '2026-06-03');
    expect(result).toEqual([]);
  });

  it('T-AIFT-02c: returns [] for empty login without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await fetchYesterdayCommits('', 'ghp_token', '2026-06-03');
    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
