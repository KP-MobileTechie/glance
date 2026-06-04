'use client';
import { useEffect, useState } from 'react';

function weatherIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('clear') || l.includes('sunny')) return '☀️';
  if (l.includes('few clouds') || l.includes('partly')) return '⛅';
  if (l.includes('cloud') || l.includes('overcast')) return '☁️';
  if (l.includes('rain') || l.includes('drizzle') || l.includes('shower')) return '🌧️';
  if (l.includes('thunder') || l.includes('storm')) return '⛈️';
  if (l.includes('snow') || l.includes('sleet')) return '❄️';
  if (l.includes('mist') || l.includes('fog') || l.includes('haze')) return '🌫️';
  return '🌡️';
}
import type { WidgetProps } from './ClockWidget';
import { fetchWeather, fetchWeatherByCity, type Weather } from '@/lib/weather/weather';
import { quoteOfDay } from '@/lib/quotes/quotes';

type WeatherStatus = 'idle' | 'loading' | 'ok' | 'geo-denied' | 'city-not-found' | 'network-error';

export function WeatherQuoteWidget({ state, onChange }: WidgetProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [city, setCity] = useState('');
  const quote = quoteOfDay(new Date());

  useEffect(() => {
    let cancelled = false;
    const TEN_MIN = 10 * 60 * 1000;

    async function load() {
      if (cancelled) return;
      setStatus('loading');
      if (state.weatherCity) {
        try {
          const r = await fetchWeatherByCity(state.weatherCity);
          if (!cancelled) { setWeather(r.weather); setStatus('ok'); }
        } catch (err) {
          if (!cancelled) {
            const msg = err instanceof Error ? err.message : '';
            if (msg === 'City not found') {
              setStatus('city-not-found');
            } else {
              setStatus('network-error');
            }
          }
        }
        return;
      }
      if (!navigator.geolocation) { if (!cancelled) setStatus('geo-denied'); return; }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
            if (!cancelled) { setWeather(w); setStatus('ok'); }
          } catch {
            if (!cancelled) setStatus('network-error');
          }
        },
        () => { if (!cancelled) setStatus('geo-denied'); },
      );
    }

    load();
    const interval = setInterval(load, TEN_MIN);
    return () => { cancelled = true; clearInterval(interval); };
  }, [state.weatherCity]);

  function submitCity() {
    const name = city.trim();
    if (!name) return;
    fetchWeatherByCity(name)
      .then((r) => { setWeather(r.weather); setStatus('ok'); onChange({ weatherCity: name }); })
      .catch(() => setStatus('city-not-found'));
    setCity('');
  }

  const showCityInput = status === 'geo-denied' || status === 'city-not-found';

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div className="glance-label">weather</div>
        <div className="mt-2 flex items-baseline gap-2">
          {status === 'ok' && weather ? (
            <>
              <span style={{ color: 'var(--glance-accent)', fontSize: '1.6rem', fontWeight: 300, textShadow: '0 0 18px var(--glance-accent-glow)' }}>
                {state.settings.tempUnit === 'F' ? Math.round(weather.tempC * 9 / 5 + 32) : weather.tempC}&deg;{state.settings.tempUnit}
              </span>
              <span className="text-sm" style={{ color: 'var(--glance-muted)' }}><span className="mr-1">{weatherIcon(weather.label)}</span>{weather.label}</span>
            </>
          ) : status === 'geo-denied' ? (
            <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>location access denied — enter a city below</span>
          ) : status === 'city-not-found' ? (
            <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>city not found — try another name</span>
          ) : status === 'network-error' ? (
            <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>weather unavailable — check your connection</span>
          ) : (
            <span className="glance-skeleton inline-block" style={{ width: '8rem', height: '1.6rem', borderRadius: '0.5rem' }} aria-label="loading weather" />
          )}
        </div>
      </div>
      {showCityInput && !weather && (
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
