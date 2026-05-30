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
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: 'var(--glance-muted)' }}>
        <IconFocus /> today&apos;s focus
      </div>
      <input
        className="w-full bg-transparent text-lg outline-none"
        style={{ color: 'var(--glance-text)' }}
        placeholder="your main focus today"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { if (value !== state.focus) onChange({ focus: value }); }}
      />
      <ul className="flex flex-col gap-1">
        {state.todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} aria-label={`toggle ${t.text}`} />
            <span style={{ color: 'var(--glance-text)', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.text}</span>
            <button onClick={() => remove(t.id)} aria-label={`remove ${t.text}`} className="ml-auto text-xs" style={{ color: 'var(--glance-muted)' }}>x</button>
          </li>
        ))}
      </ul>
      <input
        className="w-full bg-transparent text-sm outline-none"
        style={{ color: 'var(--glance-text)' }}
        placeholder="add a task"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') addTodo(); }}
      />
    </div>
  );
}
