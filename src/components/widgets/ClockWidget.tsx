'use client';
import { useEffect, useState } from 'react';
import type { AppState } from '@/lib/store/types';

export interface WidgetProps {
  state: AppState;
  onChange: (patch: Partial<AppState>) => void;
}

function greeting(h: number): string {
  if (h < 12) return 'good morning';
  if (h < 18) return 'good afternoon';
  return 'good evening';
}

export function ClockWidget({ state, now }: WidgetProps & { now?: Date }) {
  const [time, setTime] = useState<Date>(now ?? new Date());
  useEffect(() => {
    if (now) return;
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [now]);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const name = state.userName ? `, ${state.userName}` : '';
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="text-5xl font-light tracking-tight" style={{ color: 'var(--glance-accent)', textShadow: '0 0 16px var(--glance-accent-glow)' }}>
        {hh}:{mm}
      </div>
      <p className="mt-2 text-sm" style={{ color: 'var(--glance-muted)' }}>
        {greeting(time.getHours())}{name}
      </p>
    </div>
  );
}
