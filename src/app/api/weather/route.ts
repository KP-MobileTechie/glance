import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get('lat');
  const lonRaw = searchParams.get('lon');
  if (!latRaw || !lonRaw) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'lat and lon must be valid coordinates' }, { status: 400 });
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  try {
    const upstream = await fetch(url, { next: { revalidate: 600 } });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'upstream failed' }, { status: 502 });
    }
    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json({ error: 'upstream failed' }, { status: 502 });
  }
}
