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

export interface GeoResult { lat: number; lon: number; name: string; }

export function parseGeocode(json: unknown): GeoResult {
  const results = (json as { results?: Array<{ latitude?: number; longitude?: number; name?: string }> }).results;
  const first = results && results[0];
  if (!first || typeof first.latitude !== 'number' || typeof first.longitude !== 'number') {
    throw new Error('City not found');
  }
  return { lat: first.latitude, lon: first.longitude, name: first.name ?? '' };
}

export async function geocodeCity(city: string): Promise<GeoResult> {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
  if (!res.ok) throw new Error('Geocode request failed');
  return parseGeocode(await res.json());
}

export async function fetchWeatherByCity(city: string): Promise<{ weather: Weather; geo: GeoResult }> {
  const geo = await geocodeCity(city);
  const weather = await fetchWeather(geo.lat, geo.lon);
  return { weather, geo };
}
