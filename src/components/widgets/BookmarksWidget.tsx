'use client';
import { useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { Bookmark } from '@/lib/store/types';

export function BookmarksWidget({ state, onChange }: WidgetProps) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  function cancel() {
    setLabel(''); setUrl(''); setAdding(false);
  }

  function save() {
    if (!label || !url) return;
    const bookmark: Bookmark = { id: crypto.randomUUID(), label, url };
    onChange({ bookmarks: [...state.bookmarks, bookmark] });
    setLabel(''); setUrl(''); setAdding(false);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="glance-label">quick launch</div>
      <div className="flex flex-wrap gap-2">
        {state.bookmarks.map((b) => (
          <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className="glance-chip glance-bookmark">
            <span className="glance-mono-badge" aria-hidden="true">{b.label.charAt(0).toUpperCase()}</span>
            {b.label}
          </a>
        ))}
        <button onClick={() => setAdding(true)} aria-label="add bookmark" className="glance-chip">
          + add
        </button>
      </div>
      {adding && (
        <div className="flex flex-wrap items-center gap-2">
          <input placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)} className="glance-field" style={{ width: '6.5rem' }} />
          <input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className="glance-field" style={{ flex: '1 1 9rem' }} />
          <button onClick={save} className="glance-btn-primary text-sm">save</button>
          <button onClick={cancel} className="glance-chip">cancel</button>
        </div>
      )}
    </div>
  );
}
