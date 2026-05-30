import { describe, it, expect, vi } from 'vitest';
import { listPublicThemes, publishTheme } from './gallery';
import { getTheme } from '@/lib/theme/themes';

describe('gallery', () => {
  it('listPublicThemes returns rows ordered by use_count desc', async () => {
    const rows = [{ id: 'a', name: 'A', theme: getTheme('dark-neon-dev'), use_count: 9 }];
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const client = { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order })) })) })) };
    const result = await listPublicThemes(client as never);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('A');
  });

  it('publishTheme inserts a public row for the author', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: vi.fn(() => ({ insert })) };
    await publishTheme(client as never, 'user-1', { ...getTheme('paper-calm'), id: 'c1', name: 'Mine' });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ author_id: 'user-1', name: 'Mine', is_public: true }),
    );
  });

  it('publishTheme throws when the insert fails', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'rls denied' } });
    const client = { from: vi.fn(() => ({ insert })) };
    await expect(
      publishTheme(client as never, 'user-1', { ...getTheme('paper-calm'), id: 'c2', name: 'Bad' }),
    ).rejects.toBeTruthy();
  });
});
