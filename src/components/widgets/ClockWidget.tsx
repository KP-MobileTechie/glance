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
  const { clock24h, showSeconds } = state.settings;
  const h24 = time.getHours();
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hh = clock24h ? String(h24).padStart(2, '0') : String(h12);
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const name = state.userName ? `, ${state.userName}` : '';
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="glance-label">clock</div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="glance-clock">
          <span className="glance-hhmm">{hh}<span className="glance-colon">:</span>{mm}</span>
          {showSeconds && <span className="sec">{ss}</span>}
          {!clock24h && <span className="sec">{meridiem}</span>}
        </div>
        <p className="glance-greet mt-3">
          {greeting(time.getHours())}{name}
        </p>
      </div>
    </div>
  );
}
