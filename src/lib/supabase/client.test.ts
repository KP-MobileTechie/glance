import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isSupabaseConfigured } from './client';

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL';
const ANON_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

describe('isSupabaseConfigured', () => {
  const saved = { url: process.env[URL_KEY], anon: process.env[ANON_KEY] };
  beforeEach(() => { delete process.env[URL_KEY]; delete process.env[ANON_KEY]; });
  afterEach(() => { process.env[URL_KEY] = saved.url; process.env[ANON_KEY] = saved.anon; });

  it('is false when env vars are missing', () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('is true when both env vars are present', () => {
    process.env[URL_KEY] = 'https://example.supabase.co';
    process.env[ANON_KEY] = 'anon-key';
    expect(isSupabaseConfigured()).toBe(true);
  });
});
