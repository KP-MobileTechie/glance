'use client';
import { useEffect, useRef } from 'react';

export interface ParticleBackgroundProps {
  enabled: boolean;
}

export function ParticleBackground({ enabled }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
      return;
    }

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--glance-accent')
      .trim();

    const worker = new Worker(new URL('./particle-worker.js', import.meta.url));
    workerRef.current = worker;

    let particles: Array<{ x: number; y: number; r: number; a: number }> = [];

    worker.onmessage = (e) => {
      particles = e.data;
    };

    worker.postMessage({ type: 'init', count: 60, w: canvas.width, h: canvas.height });

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = accent;
        for (const p of particles) {
          ctx.globalAlpha = p.a;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      worker.postMessage({ type: 'tick', w, h });
      rafRef.current = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.35,
      }}
    />
  );
}
