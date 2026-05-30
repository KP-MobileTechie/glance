import { getDB, STATE_KEY } from './db';
import { defaultState, type AppState } from './types';

type Listener = (state: AppState) => void;
const listeners = new Set<Listener>();

export async function loadState(): Promise<AppState> {
  const db = await getDB();
  const stored = await db.get('app', STATE_KEY);
  return stored ?? defaultState();
}

export async function saveState(state: AppState): Promise<void> {
  const db = await getDB();
  await db.put('app', state, STATE_KEY);
  listeners.forEach((fn) => fn(state));
}

export async function updateState(patch: Partial<AppState>): Promise<AppState> {
  const current = await loadState();
  const next: AppState = { ...current, ...patch, updatedAt: Date.now() };
  await saveState(next);
  return next;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
