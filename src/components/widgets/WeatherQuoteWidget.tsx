'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { fetchWeather, type Weather } from '@/lib/weather/weather';
import { quoteOfDay } from '@/lib/quotes/quotes';

export function WeatherQuoteWidget(_props: WidgetProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [denied, setDenied] = useState(false);
  const quote = quoteOfDay(new Date());

  useEffect(() => {
    if (!navigator.geolocation) { setDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { fetchWeather(pos.coords.latitude, pos.coords.longitude).then(setWeather).catch(() => setDenied(true)); },
      () => setDenied(true),
    );
  }, []);

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="text-sm" style={{ color: 'var(--glance-muted)' }}>
        {weather ? `${weather.tempC}deg ${weather.label}` : denied ? 'weather unavailable' : 'locating...'}
      </div>
      <blockquote className="text-xs italic" style={{ color: 'var(--glance-muted)' }}>
        &ldquo;{quote.text}&rdquo; &mdash; {quote.author}
      </blockquote>
    </div>
  );
}
