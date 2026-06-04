'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import type { PomodoroSession } from '@/lib/store/types';

type WorkerOutbound =
  | { type: 'TICK'; remaining: number; phase: 'work' | 'break' }
  | { type: 'COMPLETE'; phase: 'work' | 'break' }

export function PomodoroWidget({ state, onChange }: WidgetProps) {
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [remaining, setRemaining] = useState(state.pomodoroConfig.workMin * 60);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../../lib/pomodoro/pomodoro.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data as WorkerOutbound;
      if (msg.type === 'TICK') {
        setRemaining(msg.remaining);
        setPhase(msg.phase);
        localStorage.setItem('glance_pomodoro_tick', JSON.stringify({ deadline: Date.now() + msg.remaining * 1000 }));
      } else if (msg.type === 'COMPLETE') {
        if (msg.phase === 'work') {
          const session: PomodoroSession = {
            id: crypto.randomUUID(),
            completedAt: Date.now(),
            type: 'work',
            durationMin: state.pomodoroConfig.workMin,
          };
          onChange({ pomodoroSessions: [...state.pomodoroSessions, session] });
        }
        setTimerState('idle');
      }
    };
    // Recovery on mount: check localStorage for in-progress deadline
    const saved = localStorage.getItem('glance_pomodoro_tick');
    if (saved) {
      try {
        const { deadline } = JSON.parse(saved) as { deadline: number };
        const leftMs = deadline - Date.now();
        if (leftMs > 0) setRemaining(Math.round(leftMs / 1000));
      } catch { /* ignore corrupt data */ }
    }
    return () => worker.terminate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePlay() {
    workerRef.current?.postMessage({ type: 'START', workMin: state.pomodoroConfig.workMin, breakMin: state.pomodoroConfig.breakMin });
    setTimerState('running');
  }

  function handlePause() {
    workerRef.current?.postMessage({ type: 'PAUSE' });
    setTimerState('paused');
  }

  function handleReset() {
    workerRef.current?.postMessage({ type: 'RESET' });
    setTimerState('idle');
    setRemaining(state.pomodoroConfig.workMin * 60);
    setPhase('work');
    localStorage.removeItem('glance_pomodoro_tick');
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const workSessions = state.pomodoroSessions.filter((s) => s.type === 'work');
  const recent = [...state.pomodoroSessions].reverse().slice(0, 5);

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      <div className="glance-label">pomodoro</div>
      {/* Countdown */}
      <div style={{ color: 'var(--glance-accent)', fontSize: '2rem', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {mm}:{ss}
      </div>
      <div className="text-xs" style={{ color: 'var(--glance-muted)' }}>{phase}</div>

      {/* Controls */}
      <div className="flex gap-2">
        {timerState !== 'running' ? (
          <button type="button" className="glance-chip text-xs" aria-label="play" onClick={handlePlay}>
            play
          </button>
        ) : (
          <button type="button" className="glance-chip text-xs" aria-label="pause" onClick={handlePause}>
            pause
          </button>
        )}
        <button type="button" className="glance-chip text-xs" aria-label="reset" onClick={handleReset}>
          reset
        </button>
      </div>

      {/* Config inputs */}
      <div className="flex gap-2 items-center">
        <label className="text-xs" style={{ color: 'var(--glance-muted)' }} htmlFor="work-min">
          work min
        </label>
        <input
          id="work-min"
          type="number"
          min={1}
          max={99}
          aria-label="work minutes"
          className="glance-field text-xs"
          style={{ width: '3rem' }}
          value={state.pomodoroConfig.workMin}
          onChange={(e) =>
            onChange({ pomodoroConfig: { workMin: Number(e.target.value), breakMin: state.pomodoroConfig.breakMin } })
          }
        />
        <label className="text-xs" style={{ color: 'var(--glance-muted)' }} htmlFor="break-min">
          break min
        </label>
        <input
          id="break-min"
          type="number"
          min={1}
          max={99}
          aria-label="break minutes"
          className="glance-field text-xs"
          style={{ width: '3rem' }}
          value={state.pomodoroConfig.breakMin}
          onChange={(e) =>
            onChange({ pomodoroConfig: { workMin: state.pomodoroConfig.workMin, breakMin: Number(e.target.value) } })
          }
        />
      </div>

      {/* Session count */}
      <div className="text-xs" style={{ color: 'var(--glance-muted)' }}>
        {workSessions.length} sessions completed
      </div>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <ul className="flex flex-col gap-1">
          {recent.map((s) => (
            <li key={s.id} className="text-xs" style={{ color: 'var(--glance-muted)' }}>
              {new Date(s.completedAt).toLocaleTimeString()} — {s.durationMin}m {s.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
