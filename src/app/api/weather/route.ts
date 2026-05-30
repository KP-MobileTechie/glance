import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const upstream = await fetch(url, { next: { revalidate: 600 } });
  if (!upstream.ok) {
    return NextResponse.json({ error: 'upstream failed' }, { status: 502 });
  }
  return NextResponse.json(await upstream.json());
}
