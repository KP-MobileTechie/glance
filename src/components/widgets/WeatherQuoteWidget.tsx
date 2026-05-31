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
      <div>
        <div className="glance-label">weather</div>
        <div className="mt-2 flex items-baseline gap-2">
          {weather ? (
            <>
              <span style={{ color: 'var(--glance-accent)', fontSize: '1.6rem', fontWeight: 300, textShadow: '0 0 18px var(--glance-accent-glow)' }}>
                {state.settings.tempUnit === 'F' ? Math.round(weather.tempC * 9 / 5 + 32) : weather.tempC}&deg;{state.settings.tempUnit}
              </span>
              <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>{weather.label}</span>
            </>
          ) : denied ? (
            <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>weather unavailable</span>
          ) : (
            <span className="glance-skeleton inline-block" style={{ width: '8rem', height: '1.6rem', borderRadius: '0.5rem' }} aria-label="loading weather" />
          )}
        </div>
      </div>
      {denied && !weather && (
        <input
          className="glance-input text-xs"
          placeholder="enter your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitCity(); }}
          aria-label="enter your city"
        />
      )}
      <blockquote
        className="text-xs italic"
        style={{ color: 'var(--glance-muted)', borderLeft: '2px solid color-mix(in oklab, var(--glance-accent) 60%, transparent)', paddingLeft: '0.65rem' }}
      >
        &ldquo;{quote.text}&rdquo; &mdash; {quote.author}
      </blockquote>
    </div>
  );
}
