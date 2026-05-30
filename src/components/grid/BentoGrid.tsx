'use client';
import GridLayout from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { AppState, GridPos } from '@/lib/store/types';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';

export interface BentoGridProps {
  state: AppState;
  onChange: (patch: Partial<AppState>) => void;
  onLayoutChange: (next: AppState['widgets']) => void;
  width?: number;
}

export function BentoGrid({ state, onChange, onLayoutChange, width = 960 }: BentoGridProps) {
  const layout: Layout = state.widgets.map((w): LayoutItem => ({ i: w.id, ...w.pos }));

  function handleLayoutChange(next: Layout) {
    const byId = new Map(next.map((l) => [l.i, l]));
    const widgets = state.widgets.map((w) => {
      const l = byId.get(w.id);
      const pos: GridPos = l ? { x: l.x, y: l.y, w: l.w, h: l.h } : w.pos;
      return { ...w, pos };
    });
    onLayoutChange(widgets);
  }

  return (
    <GridLayout
      className="layout"
      layout={layout}
      width={width}
      gridConfig={{ cols: 8, rowHeight: 64, margin: [16, 16] as const }}
      dragConfig={{ cancel: 'input,a,button' }}
      onLayoutChange={handleLayoutChange}
    >
      {state.widgets.map((w) => {
        const { Component, title } = WIDGET_REGISTRY[w.kind];
        return (
          <div key={w.id} className="overflow-hidden rounded-2xl border p-4"
               style={{ background: 'var(--glance-surface)', borderColor: 'var(--glance-border)', borderRadius: 'var(--glance-radius)' }}>
            <span className="sr-only">{title}</span>
            <Component state={state} onChange={onChange} />
          </div>
        );
      })}
    </GridLayout>
  );
}
