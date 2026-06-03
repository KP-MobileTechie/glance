import { describe, it, expect, beforeEach } from 'vitest';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import { getDB, resetDB, STATE_KEY } from './db';
import { getSecret, saveSecret, deleteSecret } from './secrets';

beforeEach(async () => {
  // Replace the global indexedDB with a fresh in-memory instance so each
  // test starts from a completely clean slate without leftover connections.
  (globalThis as Record<string, unknown>).indexedDB = new FDBFactory();
  resetDB();
});

describe('secrets store', () => {
  it('saveSecret then getSecret returns the saved value', async () => {
    await saveSecret('openai_api_key', 'sk-test');
    const result = await getSecret('openai_api_key');
    expect(result).toBe('sk-test');
  });

  it('getSecret returns undefined for an unset key', async () => {
    const result = await getSecret('openai_api_key');
    expect(result).toBeUndefined();
  });

  it('deleteSecret removes the key so getSecret returns undefined', async () => {
    await saveSecret('anthropic_api_key', 'ant-test-key');
    await deleteSecret('anthropic_api_key');
    const result = await getSecret('anthropic_api_key');
    expect(result).toBeUndefined();
  });

  it('saveSecret writes to the secrets store, not the app store (isolation)', async () => {
    await saveSecret('openai_api_key', 'sk-secret-value');

    // Confirm the value is in the secrets store
    const secretValue = await getSecret('openai_api_key');
    expect(secretValue).toBe('sk-secret-value');

    // Confirm the value is NOT in the app store
    const db = await getDB();
    const appValue = await db.get('app', STATE_KEY);
    // app store should be empty (undefined) — the secret was never written there
    expect(appValue).toBeUndefined();

    // Also confirm the key itself is not a key in the app store
    const appKeys = await db.getAllKeys('app');
    expect(appKeys).not.toContain('openai_api_key');
  });
});
