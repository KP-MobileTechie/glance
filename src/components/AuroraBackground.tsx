'use client';
import { useEffect, useRef } from 'react';

export interface AuroraBackgroundProps {
  enabled: boolean;
}

export function AuroraBackground({ enabled }: AuroraBackgroundProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = divRef.current;
    if (!el) return;

    const onVisibility = () => {
      el.style.animationPlayState = document.hidden ? 'paused' : 'running';
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={divRef} className="glance-aurora-bg" aria-hidden="true" />;
}
