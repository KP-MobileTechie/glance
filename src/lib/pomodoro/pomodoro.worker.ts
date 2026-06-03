/// <reference lib="webworker" />

type WorkerInbound =
  | { type: 'START'; workMin: number; breakMin: number }
  | { type: 'PAUSE' }
  | { type: 'RESET' }

type WorkerOutbound =
  | { type: 'TICK'; remaining: number; phase: 'work' | 'break' }
  | { type: 'COMPLETE'; phase: 'work' | 'break' }

let remaining = 0;
let phase: 'work' | 'break' = 'work';
let intervalId: ReturnType<typeof setInterval> | null = null;
let workMin = 25;
let breakMin = 5;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data as WorkerInbound;
  switch (msg.type) {
    case 'START': {
      workMin = msg.workMin;
      breakMin = msg.breakMin;
      if (!intervalId) {
        if (remaining === 0) {
          remaining = phase === 'work' ? workMin * 60 : breakMin * 60;
        }
        intervalId = setInterval(() => {
          remaining -= 1;
          const out: WorkerOutbound = { type: 'TICK', remaining, phase };
          self.postMessage(out);
          if (remaining <= 0) {
            clearInterval(intervalId!);
            intervalId = null;
            const completeMsg: WorkerOutbound = { type: 'COMPLETE', phase };
            self.postMessage(completeMsg);
            // Toggle phase and prepare for next session (but don't auto-start)
            phase = phase === 'work' ? 'break' : 'work';
            remaining = phase === 'work' ? workMin * 60 : breakMin * 60;
          }
        }, 1000);
      }
      break;
    }
    case 'PAUSE': {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;
    }
    case 'RESET': {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      phase = 'work';
      remaining = workMin * 60;
      break;
    }
  }
};
