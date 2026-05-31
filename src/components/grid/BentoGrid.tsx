'use client';
import { useState } from 'react';
import type { AppState } from '@/lib/store/types';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';

export interface BentoGridProps {
  state: AppState;
  onChange: (patch: Partial<AppState>) => void;
  onLayoutChange: (next: AppState['widgets']) => void;
}

// Elements that should never start a tile drag (so clicks, typing, and
// link navigation keep working inside a draggable tile).
const INTERACTIVE = 'input,a,button,textarea,select,label,[role="button"]';

export function BentoGrid({ state, onChange, onLayoutChange }: BentoGridProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Drag-to-rearrange reorders the widgets array.
  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const arr = [...state.widgets];
    const from = arr.findIndex((w) => w.id === fromId);
    const to = arr.findIndex((w) => w.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onLayoutChange(arr);
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gridAutoRows: '84px', gridAutoFlow: 'dense' }}>
      {state.widgets.filter((w) => !w.hidden).map((w) => {
        const { Component, title } = WIDGET_REGISTRY[w.kind];
        const dragging = dragId === w.id;
        const isOver = overId === w.id && dragId !== null && dragId !== w.id;
        // Build the class list from standalone tokens. Gluing a utility like
        // `p-6` directly to a ${} expression hides it from Tailwind's scanner,
        // so the padding rule never gets generated.
        const tileClass = ['glance-tile', 'p-6', dragging && 'glance-tile-dragging', isOver && 'glance-tile-over']
          .filter(Boolean)
          .join(' ');
        return (
          <div
            key={w.id}
            className={tileClass}
            style={{ gridColumn: `span ${w.span.w}`, gridRow: `span ${w.span.h}` }}
            draggable
            onDragStart={(e) => {
              if ((e.target as HTMLElement).closest(INTERACTIVE)) { e.preventDefault(); return; }
              setDragId(w.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => { if (dragId && dragId !== w.id) { e.preventDefault(); setOverId(w.id); } }}
            onDragLeave={() => setOverId((id) => (id === w.id ? null : id))}
            onDrop={(e) => { e.preventDefault(); if (dragId) reorder(dragId, w.id); setDragId(null); setOverId(null); }}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
          >
            <span className="sr-only">{title}</span>
            <Component state={state} onChange={onChange} />
          </div>
        );
      })}
    </div>
  );
}
