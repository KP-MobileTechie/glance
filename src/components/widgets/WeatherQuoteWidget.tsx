'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { fetchWeather, fetchWeatherByCity, type Weather } from '@/lib/weather/weather';
import { quoteOfDay } from '@/lib/quotes/quotes';

export function WeatherQuoteWidget({ state, onChange }: WidgetProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [denied, setDenied] = useState(false);
  const [city, setCity] = useState('');
  const quote = quoteOfDay(new Date());

  useEffect(() => {
    if (state.weatherCity) {
      fetchWeatherByCity(state.weatherCity).then((r) => setWeather(r.weather)).catch(() => setDenied(true));
      return;
    }
    if (!navigator.geolocation) { setDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { fetchWeather(pos.coords.latitude, pos.coords.longitude).then(setWeather).catch(() => setDenied(true)); },
      () => setDenied(true),
    );
  }, [state.weatherCity]);

  function submitCity() {
    const name = city.trim();
    if (!name) return;
    fetchWeatherByCity(name)
      .then((r) => { setWeather(r.weather); setDenied(false); onChange({ weatherCity: name }); })
      .catch(() => setDenied(true));
    setCity('');
  }

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="text-sm" style={{ color: 'var(--glance-muted)' }}>
        {weather ? `${weather.tempC}deg ${weather.label}` : denied ? 'weather unavailable' : 'locating...'}
      </div>
      {denied && !weather && (
        <input
          className="w-full bg-transparent text-xs outline-none"
          style={{ color: 'var(--glance-text)' }}
          placeholder="enter your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitCity(); }}
          aria-label="enter your city"
        />
      )}
      <blockquote className="text-xs italic" style={{ color: 'var(--glance-muted)' }}>
        &ldquo;{quote.text}&rdquo; &mdash; {quote.author}
      </blockquote>
    </div>
  );
}
