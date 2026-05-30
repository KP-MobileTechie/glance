import { describe, it, expect } from 'vitest';
import { parseWeather, weatherLabel, parseGeocode } from './weather';

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

describe('parseGeocode', () => {
  it('extracts lat/lon/name from the first geocoding result', () => {
    const g = parseGeocode({ results: [{ latitude: 51.5, longitude: -0.12, name: 'London' }] });
    expect(g).toEqual({ lat: 51.5, lon: -0.12, name: 'London' });
  });
  it('throws when there are no results', () => {
    expect(() => parseGeocode({ results: [] })).toThrow();
    expect(() => parseGeocode({})).toThrow();
  });
});
