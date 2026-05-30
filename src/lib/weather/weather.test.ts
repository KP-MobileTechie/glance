import { describe, it, expect } from 'vitest';
import { parseWeather, weatherLabel } from './weather';

describe('parseWeather', () => {
  it('extracts rounded temperature and a label from Open-Meteo JSON', () => {
    const json = { current: { temperature_2m: 23.6, weather_code: 2 } };
    const w = parseWeather(json);
    expect(w).toEqual({ tempC: 24, code: 2, label: weatherLabel(2) });
  });

  it('throws on malformed payloads', () => {
    expect(() => parseWeather({})).toThrow();
  });
});

describe('weatherLabel', () => {
  it('maps known WMO codes and falls back for unknown', () => {
    expect(weatherLabel(0)).toMatch(/clear/i);
    expect(weatherLabel(999)).toBe('Unknown');
  });
});
