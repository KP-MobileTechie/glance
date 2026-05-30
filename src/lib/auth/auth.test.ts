import { describe, it, expect, vi } from 'vitest';
import { signInWithGitHub, signOut, getUser } from './auth';

describe('auth (no client)', () => {
  it('getUser returns null when client is null', async () => {
    expect(await getUser(null)).toBeNull();
  });
  it('signInWithGitHub is a no-op when client is null', async () => {
    await expect(signInWithGitHub(null)).resolves.toBeUndefined();
  });
});

describe('auth (with client)', () => {
  it('signInWithGitHub calls supabase OAuth with github provider', async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { signInWithOAuth } };
    await signInWithGitHub(client as never);
    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'github' }),
    );
  });
  it('signOut calls supabase signOut', async () => {
    const out = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { signOut: out } };
    await signOut(client as never);
    expect(out).toHaveBeenCalled();
  });
});
