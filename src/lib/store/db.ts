import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppState } from './types';

interface GlanceDB extends DBSchema {
  app: { key: string; value: AppState };
  secrets: { key: string; value: string };
}

let dbPromise: Promise<IDBPDatabase<GlanceDB>> | null = null;

const DB_VERSION = 2;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GlanceDB>('glance', DB_VERSION, {
      upgrade(db, oldVersion) {
        // oldVersion 0 = fresh install — create all stores
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('app')) db.createObjectStore('app');
        }
        // oldVersion 1 = existing user — add secrets store only
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('secrets')) db.createObjectStore('secrets');
        }
      },
    });
  }
  return dbPromise;
}

export const STATE_KEY = 'state';

export function resetDB() {
  dbPromise = null;
}
