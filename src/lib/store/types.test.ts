import { describe, it, expect } from 'vitest';
import { defaultState, migrateState, WIDGET_KINDS } from './types';

describe('defaultState', () => {
  it('creates one widget instance per kind with unique ids', () => {
    const s = defaultState();
    expect(s.widgets).toHaveLength(WIDGET_KINDS.length);
    const kinds = s.widgets.map((w) => w.kind).sort();
    expect(kinds).toEqual([...WIDGET_KINDS].sort());
    const ids = new Set(s.widgets.map((w) => w.id));
    expect(ids.size).toBe(s.widgets.length);
  });

  it('defaults to the dark-neon-dev theme and empty user data', () => {
    const s = defaultState();
    expect(s.themeId).toBe('dark-neon-dev');
    expect(s.todos).toEqual([]);
    expect(s.bookmarks).toEqual([]);
    expect(s.focus).toBe('');
    expect(typeof s.updatedAt).toBe('number');
  });

  // Test A: defaultState todoLists
  it('returns todoLists with one default entry', () => {
    const s = defaultState();
    expect(s.todoLists).toHaveLength(1);
    expect(s.todoLists[0]).toEqual({ id: 'default', name: 'tasks', todos: [] });
  });

  // Test B: defaultState activeTodoListId
  it('sets activeTodoListId to "default"', () => {
    const s = defaultState();
    expect(s.activeTodoListId).toBe('default');
  });
});

describe('Phase 3 widget defaults and migration', () => {
  // T-WDGT-11b: defaultState new widgets hidden, existing visible
  it('T-WDGT-11b: defaultState new widgets have hidden:true, existing have hidden:false', () => {
    const s = defaultState();
    const newKinds = ['pomodoro', 'news', 'github', 'devTools'];
    const existingKinds = ['clock', 'focus', 'bookmarks', 'weatherQuote'];
    for (const kind of newKinds) {
      const w = s.widgets.find((x) => x.kind === kind);
      expect(w, `widget ${kind} should exist`).toBeDefined();
      expect(w!.hidden, `${kind} should be hidden`).toBe(true);
    }
    for (const kind of existingKinds) {
      const w = s.widgets.find((x) => x.kind === kind);
      expect(w, `widget ${kind} should exist`).toBeDefined();
      expect(w!.hidden, `${kind} should be visible`).toBe(false);
    }
  });

  // T-WDGT-11a: migrateState adds new widgets hidden:true to pre-Phase-3 state
  it('T-WDGT-11a: migrateState on pre-Phase-3 state adds new widgets with hidden:true', () => {
    const prePhase3 = {
      widgets: [
        { id: 'a', kind: 'clock', span: { w: 4, h: 3 }, hidden: false },
        { id: 'b', kind: 'focus', span: { w: 4, h: 3 }, hidden: false },
        { id: 'c', kind: 'bookmarks', span: { w: 4, h: 2 }, hidden: false },
        { id: 'd', kind: 'weatherQuote', span: { w: 4, h: 2 }, hidden: false },
      ],
      themeId: 'dark-neon-dev',
      todos: [],
    };
    const result = migrateState(prePhase3);
    const newKinds = ['pomodoro', 'news', 'github', 'devTools'];
    for (const kind of newKinds) {
      const w = result.widgets.find((x) => x.kind === kind);
      expect(w, `widget ${kind} should be backfilled`).toBeDefined();
      expect(w!.hidden, `${kind} should be hidden after migration`).toBe(true);
    }
  });

  // migrateState on state missing pomodoroSessions returns []
  it('migrateState missing pomodoroSessions returns empty array', () => {
    const result = migrateState({});
    expect(result.pomodoroSessions).toEqual([]);
  });

  // migrateState on state missing pomodoroConfig returns defaults
  it('migrateState missing pomodoroConfig returns {workMin:25, breakMin:5}', () => {
    const result = migrateState({});
    expect(result.pomodoroConfig).toEqual({ workMin: 25, breakMin: 5 });
  });

  // migrateState on state missing hnConfig returns defaults
  it('migrateState missing hnConfig returns {count:10, rssUrl:null}', () => {
    const result = migrateState({});
    expect(result.hnConfig).toEqual({ count: 10, rssUrl: null });
  });

  // migrateState on state missing githubUsername returns ''
  it('migrateState missing githubUsername returns empty string', () => {
    const result = migrateState({});
    expect(result.githubUsername).toBe('');
  });

  // migrateState preserves valid pomodoroConfig values
  it('migrateState preserves valid pomodoroConfig.workMin', () => {
    const result = migrateState({ pomodoroConfig: { workMin: 30, breakMin: 10 } });
    expect(result.pomodoroConfig.workMin).toBe(30);
    expect(result.pomodoroConfig.breakMin).toBe(10);
  });

  // migrateState preserves valid hnConfig.count
  it('migrateState preserves valid hnConfig.count', () => {
    const result = migrateState({ hnConfig: { count: 20, rssUrl: null } });
    expect(result.hnConfig.count).toBe(20);
  });
});

describe('migrateState — todoLists and activeTodoListId', () => {
  // Test C: migration from legacy state seeds the default list
  it('seeds default todoList from legacy todos array when no todoLists exist', () => {
    const legacy = { todos: [{ id: 't1', text: 'x', done: false }] };
    const result = migrateState(legacy);
    expect(result.todoLists).toHaveLength(1);
    expect(result.todoLists[0].todos).toContainEqual({ id: 't1', text: 'x', done: false });
  });

  // Test D: activeTodoListId defaults to first list id when not present
  it('sets activeTodoListId to first list id when field is absent', () => {
    const result = migrateState({ todos: [] });
    expect(result.activeTodoListId).toBe(result.todoLists[0].id);
  });

  // Test E: existing todoLists are preserved unchanged
  it('preserves existing todoLists without duplication', () => {
    const input = {
      todoLists: [{ id: 'abc', name: 'work', todos: [] }],
      activeTodoListId: 'abc',
    };
    const result = migrateState(input);
    expect(result.todoLists).toHaveLength(1);
    expect(result.todoLists[0]).toEqual({ id: 'abc', name: 'work', todos: [] });
    expect(result.activeTodoListId).toBe('abc');
  });

  // Test F: priority and dueDate survive round-trip through migration
  it('preserves priority and dueDate on todos migrated into default list', () => {
    const input = {
      todos: [{ id: 't1', text: 'x', done: false, priority: 'P1', dueDate: '2026-06-10' }],
    };
    const result = migrateState(input);
    const todo = result.todoLists[0].todos[0];
    expect(todo.priority).toBe('P1');
    expect(todo.dueDate).toBe('2026-06-10');
  });
});
