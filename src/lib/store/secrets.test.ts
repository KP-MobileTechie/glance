import { describe, it, beforeEach } from 'vitest';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import { resetDB } from './db';

beforeEach(async () => {
  // Replace the global indexedDB with a fresh in-memory instance so each
  // test starts from a completely clean slate without leftover connections.
  (globalThis as Record<string, unknown>).indexedDB = new FDBFactory();
  resetDB();
});

describe('secrets store', () => {
  it.todo('reads and writes the secrets store');
});
