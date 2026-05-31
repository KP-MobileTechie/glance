import type { Theme } from '@/lib/theme/types';

export const WIDGET_KINDS = ['clock', 'focus', 'bookmarks', 'weatherQuote'] as const;
export type WidgetKind = (typeof WIDGET_KINDS)[number];

export interface WidgetSpan { w: number; h: number; }
export interface WidgetInstance { id: string; kind: WidgetKind; span: WidgetSpan; hidden: boolean; }

export interface Todo { id: string; text: string; done: boolean; }
export interface Bookmark { id: string; label: string; url: string; }

export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'brave';
export interface Settings {
  clock24h: boolean;
  showSeconds: boolean;
  tempUnit: 'C' | 'F';
  searchEngine: SearchEngine;
}

export const DEFAULT_SETTINGS: Settings = {
  clock24h: true,
  showSeconds: true,
  tempUnit: 'C',
  searchEngine: 'google',
};

export interface AppState {
  widgets: WidgetInstance[];
  themeId: string;
  customThemes: Theme[];
  userName: string;
  focus: string;
  todos: Todo[];
  bookmarks: Bookmark[];
  weatherCity: string | null;
  settings: Settings;
  updatedAt: number;
}

const DEFAULT_SPAN: Record<WidgetKind, WidgetSpan> = {
  clock: { w: 4, h: 3 },
  focus: { w: 4, h: 3 },
  bookmarks: { w: 4, h: 2 },
  weatherQuote: { w: 4, h: 2 },
};

export function defaultState(): AppState {
  return {
    widgets: WIDGET_KINDS.map((kind) => ({
      id: crypto.randomUUID(),
      kind,
      span: { ...DEFAULT_SPAN[kind] },
      hidden: false,
    })),
    themeId: 'dark-neon-dev',
    customThemes: [],
    userName: '',
    focus: '',
    todos: [],
    bookmarks: [],
    weatherCity: null,
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: 0,
  };
}

function asSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_SETTINGS };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as Record<string, any>;
  const engines: SearchEngine[] = ['google', 'duckduckgo', 'bing', 'brave'];
  return {
    clock24h: typeof r.clock24h === 'boolean' ? r.clock24h : DEFAULT_SETTINGS.clock24h,
    showSeconds: typeof r.showSeconds === 'boolean' ? r.showSeconds : DEFAULT_SETTINGS.showSeconds,
    tempUnit: r.tempUnit === 'C' || r.tempUnit === 'F' ? r.tempUnit : DEFAULT_SETTINGS.tempUnit,
    searchEngine: engines.includes(r.searchEngine) ? r.searchEngine : DEFAULT_SETTINGS.searchEngine,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asWidget(w: any): WidgetInstance | null {
  if (!w || !WIDGET_KINDS.includes(w.kind)) return null;
  const span =
    w.span && typeof w.span.w === 'number' && typeof w.span.h === 'number'
      ? { w: w.span.w, h: w.span.h }
      : w.pos && typeof w.pos.w === 'number' && typeof w.pos.h === 'number'
        ? { w: w.pos.w, h: w.pos.h }
        : { ...DEFAULT_SPAN[w.kind as WidgetKind] };
  return {
    id: typeof w.id === 'string' ? w.id : crypto.randomUUID(),
    kind: w.kind,
    span,
    hidden: typeof w.hidden === 'boolean' ? w.hidden : false,
  };
}

export function migrateState(raw: unknown): AppState {
  const base = defaultState();
  if (typeof raw !== 'object' || raw === null) return base;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as Record<string, any>;

  let widgets = base.widgets;
  if (Array.isArray(r.widgets) && r.widgets.length > 0) {
    const ordered = [...r.widgets].sort((a, b) => {
      const ay = a?.pos?.y ?? 0;
      const by = b?.pos?.y ?? 0;
      if (ay !== by) return ay - by;
      return (a?.pos?.x ?? 0) - (b?.pos?.x ?? 0);
    });
    widgets = ordered.map(asWidget).filter((w): w is WidgetInstance => w !== null);
    const seenKinds = new Set<string>();
    widgets = widgets.filter((w) => {
      if (seenKinds.has(w.kind)) return false;
      seenKinds.add(w.kind);
      return true;
    });
    for (const kind of WIDGET_KINDS) {
      if (!widgets.some((w) => w.kind === kind)) {
        widgets.push({ id: crypto.randomUUID(), kind, span: { ...DEFAULT_SPAN[kind] }, hidden: false });
      }
    }
  }

  return {
    widgets,
    themeId: typeof r.themeId === 'string' ? r.themeId : base.themeId,
    customThemes: Array.isArray(r.customThemes) ? (r.customThemes as Theme[]) : [],
    userName: typeof r.userName === 'string' ? r.userName : '',
    focus: typeof r.focus === 'string' ? r.focus : '',
    todos: Array.isArray(r.todos) ? r.todos : [],
    bookmarks: Array.isArray(r.bookmarks) ? r.bookmarks : [],
    weatherCity: typeof r.weatherCity === 'string' ? r.weatherCity : null,
    settings: asSettings(r.settings),
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0,
  };
}
