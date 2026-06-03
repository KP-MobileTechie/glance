'use client';
import { useState } from 'react';
import type { AppState } from '@/lib/store/types';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';
import { WidgetErrorBoundary } from '@/components/WidgetErrorBoundary';

export interface BentoGridProps {
  state: AppState;
  onChange: (patch: Partial<AppState>) => void;
  onLayoutChange: (next: AppState['widgets']) => void;
  mobile?: boolean;
}

const INTERACTIVE = 'input,a,button,textarea,select,label,[role="button"]';
const SPAN_CYCLE = [{ w: 4, h: 2 }, { w: 4, h: 3 }, { w: 8, h: 2 }, { w: 8, h: 3 }];

export function BentoGrid({ state, onChange, onLayoutChange, mobile = false }: BentoGridProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const visible = state.widgets.filter((w) => !w.hidden);

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const arr = [...state.widgets];
    const from = arr.findIndex((w) => w.id === fromId);
    const to = arr.findIndex((w) => w.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = arr.splice(from, 1);
    const insertAt = to;
    arr.splice(insertAt, 0, moved);
    onLayoutChange(arr);
  }

  function cycleSize(id: string) {
    onLayoutChange(
      state.widgets.map((w) => {
        if (w.id !== id) return w;
        const idx = SPAN_CYCLE.findIndex((s) => s.w === w.span.w && s.h === w.span.h);
        return { ...w, span: { ...SPAN_CYCLE[(idx + 1) % SPAN_CYCLE.length] } };
      }),
    );
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-4">
        {visible.map((w) => {
          const { Component, title } = WIDGET_REGISTRY[w.kind];
          return (
            <div key={w.id} className="glance-tile p-6" style={{ minHeight: w.kind === 'clock' ? 190 : 150 }}>
              <span className="sr-only">{title}</span>
              <WidgetErrorBoundary title={title}>
                <Component state={state} onChange={onChange} />
              </WidgetErrorBoundary>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gridAutoRows: '84px', gridAutoFlow: 'dense' }}>
      {visible.map((w) => {
        const { Component, title } = WIDGET_REGISTRY[w.kind];
        const dragging = dragId === w.id;
        const isOver = overId === w.id && dragId !== null && dragId !== w.id;
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
            <button type="button" aria-label={`resize ${title}`} className="glance-resize" onClick={() => cycleSize(w.id)}>
              &#10530;
            </button>
            <WidgetErrorBoundary title={title}>
              <Component state={state} onChange={onChange} />
            </WidgetErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}
