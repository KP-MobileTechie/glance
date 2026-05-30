'use client';
import { useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { Bookmark } from '@/lib/store/types';

export function BookmarksWidget({ state, onChange }: WidgetProps) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  function save() {
    if (!label || !url) return;
    const bookmark: Bookmark = { id: crypto.randomUUID(), label, url };
    onChange({ bookmarks: [...state.bookmarks, bookmark] });
    setLabel(''); setUrl(''); setAdding(false);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {state.bookmarks.map((b) => (
          <a key={b.id} href={b.url} className="rounded-lg border px-3 py-1 text-sm"
             style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }}>
            {b.label}
          </a>
        ))}
        <button onClick={() => setAdding(true)} aria-label="add bookmark"
          className="rounded-lg border px-3 py-1 text-sm" style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-muted)' }}>
          + add
        </button>
      </div>
      {adding && (
        <div className="flex flex-wrap gap-2">
          <input placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)}
            className="rounded border bg-transparent px-2 py-1 text-sm" style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }} />
          <input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)}
            className="rounded border bg-transparent px-2 py-1 text-sm" style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }} />
          <button onClick={save} className="rounded px-3 py-1 text-sm" style={{ background: 'var(--glance-accent)', color: 'var(--glance-bg)' }}>save</button>
        </div>
      )}
    </div>
  );
}
