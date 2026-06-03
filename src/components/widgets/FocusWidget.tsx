'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { Todo, TodoPriority } from '@/lib/store/types';
import { IconFocus } from '@/components/icons/icons';

function priorityColor(p: TodoPriority): string {
  if (p === 'P1') return '#f87171'; // red — urgent
  if (p === 'P2') return '#fb923c'; // orange — high
  if (p === 'P4') return '#94a3b8'; // slate — low
  return 'var(--glance-muted)';
}

export function FocusWidget({ state, onChange }: WidgetProps) {
  const [value, setValue] = useState(state.focus);
  const [draft, setDraft] = useState('');
  const [priority, setPriority] = useState<TodoPriority | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const prevLen = useRef(state.todos.length);
  useEffect(() => { setValue(state.focus); }, [state.focus]);

  // When a task is added, scroll the list to reveal the new item at the bottom.
  useEffect(() => {
    if (state.todos.length > prevLen.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevLen.current = state.todos.length;
  }, [state.todos.length]);

  // Compute today's date using local time (not UTC) to avoid timezone off-by-one
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
    onChange({ todos: [...state.todos, todo] });
    setDraft('');
    setPriority(undefined);
    setDueDate('');
  }
  function toggle(id: string) {
    onChange({ todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  }
  function remove(id: string) {
    onChange({ todos: state.todos.filter((t) => t.id !== id) });
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
      <ul ref={listRef} className="glance-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1.5">
        {state.todos.length === 0 && (
          <li className="text-xs italic" style={{ color: 'color-mix(in oklab, var(--glance-muted) 60%, transparent)' }}>
            no tasks yet
          </li>
        )}
        {state.todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 overflow-hidden text-sm">
            <input type="checkbox" className="glance-check shrink-0" checked={t.done} onChange={() => toggle(t.id)} aria-label={`toggle ${t.text}`} />
            {t.priority && t.priority !== 'P3' && (
              <span
                className="glance-priority-badge text-xs shrink-0"
                style={{ color: priorityColor(t.priority) }}
              >
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
