import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') || '38.7169';
  const lon = searchParams.get('lon') || '-9.1390';
  const radius = searchParams.get('radius') || '10000'; // meters
  const slide = searchParams.get('slide') || null;
  const bench = searchParams.get('bench') || null;
  const shade = searchParams.get('shade') || null;

  // Construct Overpass QL query
  let overpassQuery = `[out:json][timeout:25];
    node(around:${radius},${lat},${lon})["leisure"="playground"];
    out body;`;

  // Add filters if any
  let filters: string[] = [];
  if (slide === 'yes') filters.push(`["playground:slide"="yes"]`);
  if (bench === 'yes') filters.push(`["bench"="yes"]`);
  if (shade === 'yes') filters.push(`["shade"="yes"]`);

  if (filters.length > 0) {
    overpassQuery = `[out:json][timeout:25];
      node(around:${radius},${lat},${lon})["leisure"="playground"]${filters.join('')};
      out body;`;
  }

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  });

  const data = await response.json();
  return NextResponse.json(data);
}
