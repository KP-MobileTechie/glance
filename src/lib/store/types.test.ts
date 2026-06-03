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
