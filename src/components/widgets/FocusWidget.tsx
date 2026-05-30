'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { IconFocus } from '@/components/icons/icons';

export function FocusWidget({ state, onChange }: WidgetProps) {
  const [value, setValue] = useState(state.focus);
  useEffect(() => { setValue(state.focus); }, [state.focus]);
  return (
    <div className="flex h-full flex-col gap-2">
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
    </div>
  );
}
