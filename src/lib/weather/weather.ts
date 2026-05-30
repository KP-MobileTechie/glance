export interface Weather { tempC: number; code: number; label: string; }

const WMO: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 61: 'Light rain',
  63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 95: 'Thunderstorm',
};

export function weatherLabel(code: number): string {
  return WMO[code] ?? 'Unknown';
}

export function parseWeather(json: unknown): Weather {
  const current = (json as { current?: { temperature_2m?: number; weather_code?: number } }).current;
  if (!current || typeof current.temperature_2m !== 'number' || typeof current.weather_code !== 'number') {
    throw new Error('Malformed weather payload');
  }
  return {
    tempC: Math.round(current.temperature_2m),
    code: current.weather_code,
    label: weatherLabel(current.weather_code),
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Weather request failed');
  return parseWeather(await res.json());
}
