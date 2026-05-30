import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppState } from './types';

interface GlanceDB extends DBSchema {
  app: { key: string; value: AppState };
}

let dbPromise: Promise<IDBPDatabase<GlanceDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GlanceDB>('glance', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('app')) db.createObjectStore('app');
      },
    });
  }
  return dbPromise;
}

export const STATE_KEY = 'state';
