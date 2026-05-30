'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { Todo } from '@/lib/store/types';
import { IconFocus } from '@/components/icons/icons';

export function FocusWidget({ state, onChange }: WidgetProps) {
  const [value, setValue] = useState(state.focus);
  const [draft, setDraft] = useState('');
  useEffect(() => { setValue(state.focus); }, [state.focus]);

  function addTodo() {
    const text = draft.trim();
    if (!text) return;
    const todo: Todo = { id: crypto.randomUUID(), text, done: false };
    onChange({ todos: [...state.todos, todo] });
    setDraft('');
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
      <ul className="glance-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1.5">
        {state.todos.length === 0 && (
          <li className="text-xs italic" style={{ color: 'color-mix(in oklab, var(--glance-muted) 60%, transparent)' }}>
            no tasks yet
          </li>
        )}
        {state.todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="glance-check shrink-0" checked={t.done} onChange={() => toggle(t.id)} aria-label={`toggle ${t.text}`} />
            <span className="truncate" style={{ color: 'var(--glance-text)', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
            <button onClick={() => remove(t.id)} aria-label={`remove ${t.text}`} className="glance-todo-remove ml-auto shrink-0 text-base leading-none">&times;</button>
          </li>
        ))}
      </ul>
      <input
        className="glance-input shrink-0 text-sm"
        placeholder="add a task"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') addTodo(); }}
      />
    </div>
  );
}
