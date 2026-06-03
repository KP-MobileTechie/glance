import { getDB } from './db';

export type SecretKey = 'openai_api_key' | 'anthropic_api_key';

export async function getSecret(key: SecretKey): Promise<string | undefined> {
  const db = await getDB();
  return db.get('secrets', key);
}

export async function saveSecret(key: SecretKey, value: string): Promise<void> {
  const db = await getDB();
  // idb out-of-line key order: value first, key second
  await db.put('secrets', value, key);
}

export async function deleteSecret(key: SecretKey): Promise<void> {
  const db = await getDB();
  await db.delete('secrets', key);
}
