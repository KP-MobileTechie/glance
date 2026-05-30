export const WIDGET_KINDS = ['clock', 'focus', 'bookmarks', 'weatherQuote'] as const;
export type WidgetKind = (typeof WIDGET_KINDS)[number];

export interface GridPos { x: number; y: number; w: number; h: number; }

export interface WidgetInstance {
  id: string;
  kind: WidgetKind;
  pos: GridPos;
}

export interface Todo { id: string; text: string; done: boolean; }
export interface Bookmark { id: string; label: string; url: string; }

export interface AppState {
  widgets: WidgetInstance[];
  themeId: string;
  userName: string;
  focus: string;
  todos: Todo[];
  bookmarks: Bookmark[];
  weatherCity: string | null;
  updatedAt: number;
}

const DEFAULT_POS: Record<WidgetKind, GridPos> = {
  clock: { x: 0, y: 0, w: 4, h: 3 },
  focus: { x: 4, y: 0, w: 4, h: 3 },
  bookmarks: { x: 0, y: 3, w: 4, h: 2 },
  weatherQuote: { x: 4, y: 3, w: 4, h: 2 },
};

export function defaultState(): AppState {
  return {
    widgets: WIDGET_KINDS.map((kind) => ({
      id: crypto.randomUUID(),
      kind,
      pos: DEFAULT_POS[kind],
    })),
    themeId: 'dark-neon-dev',
    userName: '',
    focus: '',
    todos: [],
    bookmarks: [],
    weatherCity: null,
    updatedAt: 0,
  };
}
