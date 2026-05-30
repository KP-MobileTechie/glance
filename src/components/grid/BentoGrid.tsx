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

  // Drag-to-rearrange swaps the grid positions of two widgets.
  function swap(aId: string, bId: string) {
    if (aId === bId) return;
    const a = state.widgets.find((w) => w.id === aId);
    const b = state.widgets.find((w) => w.id === bId);
    if (!a || !b) return;
    const widgets = state.widgets.map((w) => {
      if (w.id === aId) return { ...w, pos: b.pos };
      if (w.id === bId) return { ...w, pos: a.pos };
      return w;
    });
    onLayoutChange(widgets);
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gridAutoRows: '84px' }}>
      {state.widgets.map((w) => {
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
            style={{ gridColumn: `${w.pos.x + 1} / span ${w.pos.w}`, gridRow: `${w.pos.y + 1} / span ${w.pos.h}` }}
            draggable
            onDragStart={(e) => {
              if ((e.target as HTMLElement).closest(INTERACTIVE)) { e.preventDefault(); return; }
              setDragId(w.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => { if (dragId && dragId !== w.id) { e.preventDefault(); setOverId(w.id); } }}
            onDragLeave={() => setOverId((id) => (id === w.id ? null : id))}
            onDrop={(e) => { e.preventDefault(); if (dragId) swap(dragId, w.id); setDragId(null); setOverId(null); }}
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
