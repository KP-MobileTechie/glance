import type { Theme } from '@/lib/theme/types';

export const WIDGET_KINDS = ['clock', 'focus', 'bookmarks', 'weatherQuote', 'pomodoro', 'news', 'github', 'devTools'] as const;
export type WidgetKind = (typeof WIDGET_KINDS)[number];

export interface WidgetSpan { w: number; h: number; }
export interface WidgetInstance { id: string; kind: WidgetKind; span: WidgetSpan; hidden: boolean; }

export type TodoPriority = 'P1' | 'P2' | 'P3' | 'P4';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority?: TodoPriority;
  dueDate?: string;
}

export interface TodoList {
  id: string;
  name: string;
  todos: Todo[];
}

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

export interface PomodoroSession {
  id: string;
  completedAt: number;   // epoch ms
  type: 'work' | 'break';
  durationMin: number;
}

export interface PomodoroConfig {
  workMin: number;   // default 25
  breakMin: number;  // default 5
}

export interface HNConfig {
  count: number;         // default 10; valid range 5-30
  rssUrl: string | null; // null = use Algolia HN API
}

export interface AppState {
  widgets: WidgetInstance[];
  themeId: string;
  customThemes: Theme[];
  userName: string;
  focus: string;
  todos: Todo[];
  todoLists: TodoList[];
  activeTodoListId: string | null;
  bookmarks: Bookmark[];
  weatherCity: string | null;
  pomodoroSessions: PomodoroSession[];
  pomodoroConfig: PomodoroConfig;
  hnConfig: HNConfig;
  githubUsername: string;
  settings: Settings;
  updatedAt: number;
}

const DEFAULT_SPAN: Record<WidgetKind, WidgetSpan> = {
  clock: { w: 4, h: 3 },
  focus: { w: 4, h: 3 },
  bookmarks: { w: 4, h: 2 },
  weatherQuote: { w: 4, h: 2 },
  pomodoro: { w: 4, h: 2 },
  news: { w: 4, h: 3 },
  github: { w: 8, h: 3 },
  devTools: { w: 4, h: 3 },
};

const HIDDEN_BY_DEFAULT = new Set<WidgetKind>(['pomodoro', 'news', 'github', 'devTools']);

export function defaultState(): AppState {
  return {
    widgets: WIDGET_KINDS.map((kind) => ({
      id: crypto.randomUUID(),
      kind,
      span: { ...DEFAULT_SPAN[kind] },
      hidden: HIDDEN_BY_DEFAULT.has(kind),
    })),
    themeId: 'dark-neon-dev',
    customThemes: [],
    userName: '',
    focus: '',
    todos: [],
    todoLists: [{ id: 'default', name: 'tasks', todos: [] }],
    activeTodoListId: 'default',
    bookmarks: [],
    weatherCity: null,
    pomodoroSessions: [],
    pomodoroConfig: { workMin: 25, breakMin: 5 },
    hnConfig: { count: 10, rssUrl: null },
    githubUsername: '',
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

function asPomodoroConfig(raw: unknown): PomodoroConfig {
  if (typeof raw !== 'object' || raw === null) return { workMin: 25, breakMin: 5 };
  const r = raw as Record<string, unknown>;
  return {
    workMin: typeof r.workMin === 'number' && r.workMin > 0 ? r.workMin : 25,
    breakMin: typeof r.breakMin === 'number' && r.breakMin > 0 ? r.breakMin : 5,
  };
}

function asHNConfig(raw: unknown): HNConfig {
  if (typeof raw !== 'object' || raw === null) return { count: 10, rssUrl: null };
  const r = raw as Record<string, unknown>;
  return {
    count: typeof r.count === 'number' && r.count >= 5 && r.count <= 30 ? r.count : 10,
    rssUrl: typeof r.rssUrl === 'string' ? r.rssUrl : null,
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
        widgets.push({ id: crypto.randomUUID(), kind, span: { ...DEFAULT_SPAN[kind] }, hidden: HIDDEN_BY_DEFAULT.has(kind) });
      }
    }
  }

  const legacyTodos: Todo[] = Array.isArray(r.todos) ? r.todos : [];
  const hasTodoLists = Array.isArray(r.todoLists) && r.todoLists.length > 0;
  const todoLists: TodoList[] = hasTodoLists
    ? (r.todoLists as TodoList[])
    : [{ id: 'default', name: 'tasks', todos: legacyTodos }];

  return {
    widgets,
    themeId: typeof r.themeId === 'string' ? r.themeId : base.themeId,
    customThemes: Array.isArray(r.customThemes) ? (r.customThemes as Theme[]) : [],
    userName: typeof r.userName === 'string' ? r.userName : '',
    focus: typeof r.focus === 'string' ? r.focus : '',
    todos: legacyTodos,
    todoLists,
    activeTodoListId: typeof r.activeTodoListId === 'string' ? r.activeTodoListId : todoLists[0]?.id ?? null,
    bookmarks: Array.isArray(r.bookmarks) ? r.bookmarks : [],
    weatherCity: typeof r.weatherCity === 'string' ? r.weatherCity : null,
    pomodoroSessions: Array.isArray(r.pomodoroSessions) ? r.pomodoroSessions : [],
    pomodoroConfig: asPomodoroConfig(r.pomodoroConfig),
    hnConfig: asHNConfig(r.hnConfig),
    githubUsername: typeof r.githubUsername === 'string' ? r.githubUsername : '',
    settings: asSettings(r.settings),
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0,
  };
}
