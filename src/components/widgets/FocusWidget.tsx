'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { AppState, Todo, TodoList, TodoPriority } from '@/lib/store/types';
import { IconFocus } from '@/components/icons/icons';

function priorityColor(p: TodoPriority): string {
  if (p === 'P1') return '#f87171';
  if (p === 'P2') return '#fb923c';
  if (p === 'P4') return '#94a3b8';
  return 'var(--glance-muted)';
}

const PRIORITY_RANK: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

function getActiveList(state: AppState): { todos: Todo[]; isDefault: boolean; listId: string | null } {
  if (!state.activeTodoListId) return { todos: state.todos, isDefault: true, listId: null };
  const found = state.todoLists.find((l) => l.id === state.activeTodoListId);
  return found
    ? { todos: found.todos, isDefault: false, listId: found.id }
    : { todos: state.todos, isDefault: true, listId: null };
}

function updateActiveTodos(
  state: AppState,
  onChange: (p: Partial<AppState>) => void,
  todos: Todo[],
) {
  const active = getActiveList(state);
  if (active.isDefault) {
    onChange({ todos });
  } else {
    onChange({
      todoLists: state.todoLists.map((l) =>
        l.id === active.listId ? { ...l, todos } : l,
      ),
    });
  }
}

export function FocusWidget({ state, onChange }: WidgetProps) {
  const [value, setValue] = useState(state.focus);
  const [draft, setDraft] = useState('');
  const [priority, setPriority] = useState<TodoPriority | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const { todos: activeTodos } = getActiveList(state);
  const prevLen = useRef(activeTodos.length);

  useEffect(() => { setValue(state.focus); }, [state.focus]);

  useEffect(() => {
    if (activeTodos.length > prevLen.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevLen.current = activeTodos.length;
  }, [activeTodos.length]);

  const now = new Date();
  const todayStr =
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0');

  function isOverdue(t: Todo): boolean {
    return !t.done && !!t.dueDate && t.dueDate < todayStr;
  }

  const sortedTodos = [...activeTodos].sort(
    (a, b) => (PRIORITY_RANK[a.priority ?? 'P3'] ?? 3) - (PRIORITY_RANK[b.priority ?? 'P3'] ?? 3),
  );

  function addTodo() {
    const text = draft.trim();
    if (!text) return;
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate ? { dueDate } : {}),
    };
    updateActiveTodos(state, onChange, [...activeTodos, todo]);
    setDraft('');
    setPriority(undefined);
    setDueDate('');
  }

  function toggle(id: string) {
    updateActiveTodos(state, onChange, activeTodos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    updateActiveTodos(state, onChange, activeTodos.filter((t) => t.id !== id));
  }

  function createList() {
    const name = newListName.trim();
    if (!name) return;
    const newList: TodoList = { id: crypto.randomUUID(), name, todos: [] };
    onChange({ todoLists: [...state.todoLists, newList] });
    setAddingList(false);
    setNewListName('');
  }

  function deleteList(listId: string) {
    onChange({
      todoLists: state.todoLists.filter((l) => l.id !== listId),
      activeTodoListId: state.activeTodoListId === listId ? null : state.activeTodoListId,
    });
  }

  function commitRename(listId: string) {
    const name = renameValue.trim();
    if (name) {
      onChange({ todoLists: state.todoLists.map((l) => l.id === listId ? { ...l, name } : l) });
    }
    setRenamingListId(null);
    setRenameValue('');
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="glance-label"><IconFocus /> today&apos;s focus</div>
      <input
        className="glance-input text-lg"
        placeholder="your main focus today"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { if (value !== state.focus) onChange({ focus: value }); }}
      />

      {/* List tab strip */}
      <div className="flex flex-wrap gap-1.5">
        {state.todoLists.map((list) => (
          <div key={list.id} className="flex items-center gap-0.5">
            {renamingListId === list.id ? (
              <input
                autoFocus
                className="glance-field text-xs w-20"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(list.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(list.id);
                  if (e.key === 'Escape') { setRenamingListId(null); setRenameValue(''); }
                }}
              />
            ) : (
              <button
                className="glance-chip text-xs"
                style={{
                  color: list.id === state.activeTodoListId ? 'var(--glance-accent)' : 'var(--glance-muted)',
                  borderColor:
                    list.id === state.activeTodoListId
                      ? 'color-mix(in oklab, var(--glance-accent) 55%, var(--glance-border))'
                      : 'var(--glance-border)',
                }}
                onClick={() => onChange({ activeTodoListId: list.id })}
                onDoubleClick={() => { setRenamingListId(list.id); setRenameValue(list.name); }}
              >
                {list.name}
              </button>
            )}
            {state.todoLists.length > 1 && list.id !== 'default' && (
              <button
                aria-label={`delete ${list.name}`}
                className="glance-todo-remove text-xs leading-none"
                onClick={() => deleteList(list.id)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {addingList ? (
          <input
            autoFocus
            className="glance-field text-xs w-24"
            placeholder="list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={createList}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createList();
              if (e.key === 'Escape') { setAddingList(false); setNewListName(''); }
            }}
          />
        ) : (
          <button className="glance-chip text-xs" onClick={() => setAddingList(true)}>+ list</button>
        )}
      </div>

      <ul ref={listRef} className="glance-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1.5">
        {sortedTodos.length === 0 && (
          <li className="text-xs italic" style={{ color: 'color-mix(in oklab, var(--glance-muted) 60%, transparent)' }}>
            no tasks yet
          </li>
        )}
        {sortedTodos.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 overflow-hidden text-sm">
            <input type="checkbox" className="glance-check shrink-0" checked={t.done} onChange={() => toggle(t.id)} aria-label={`toggle ${t.text}`} />
            {t.priority && t.priority !== 'P3' && (
              <span className="glance-priority-badge text-xs shrink-0" style={{ color: priorityColor(t.priority) }}>
                {t.priority}
              </span>
            )}
            <span
              className="min-w-0 truncate"
              style={{
                color: isOverdue(t) ? '#f87171' : 'var(--glance-text)',
                textDecoration: t.done ? 'line-through' : 'none',
                opacity: t.done ? 0.65 : 1,
              }}
            >
              {t.text}
            </span>
            <button onClick={() => remove(t.id)} aria-label={`remove ${t.text}`} className="glance-todo-remove ml-auto shrink-0 text-base leading-none">&times;</button>
          </li>
        ))}
      </ul>

      <div className="flex shrink-0 flex-col gap-1.5">
        <div className="flex gap-1.5">
          <label htmlFor="focus-priority" className="sr-only">Priority</label>
          <select
            id="focus-priority"
            aria-label="priority"
            className="glance-field text-xs"
            value={priority ?? ''}
            onChange={(e) => setPriority(e.target.value === '' ? undefined : e.target.value as TodoPriority)}
          >
            <option value="">— priority</option>
            <option value="P1">P1 Urgent</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Normal</option>
            <option value="P4">P4 Low</option>
          </select>
          <label htmlFor="focus-due-date" className="sr-only">Due date</label>
          <input
            id="focus-due-date"
            aria-label="due date"
            type="date"
            className="glance-field text-xs"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <input
          className="glance-input shrink-0 text-sm"
          placeholder="add a task"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addTodo(); }}
        />
      </div>
    </div>
  );
}
