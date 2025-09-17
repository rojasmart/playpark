import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') || '38.7169';
  const lon = searchParams.get('lon') || '-9.1390';
  const radius = searchParams.get('radius') || '15000';
  
  // Equipment filters
  const slide = searchParams.get('playground:slide') || null;
  const slideDoubleDeck = searchParams.get('playground:slide:double_deck') || null;
  const swing = searchParams.get('playground:swing') || null;
  const seesaw = searchParams.get('playground:seesaw') || null;
  const climb = searchParams.get('playground:climb') || null;
  const climbingNet = searchParams.get('playground:climbing_net') || null;
  const slider = searchParams.get('playground:slider') || null;
  const music = searchParams.get('playground:music') || null;
  const bench = searchParams.get('bench') || null;
  
  // Facility filters
  const covered = searchParams.get('covered') || null;
  const naturalShade = searchParams.get('natural_shade') || null;
  const drinkingWater = searchParams.get('drinking_water') || null;
  const wheelchair = searchParams.get('wheelchair') || null;
  
  // Age filters
  const minAge = searchParams.get('min_age') || null;
  const maxAge = searchParams.get('max_age') || null;
  
  // Surface and theme filters
  const surface = searchParams.get('surface') || null;
  const theme = searchParams.get('playground:theme') || null;

  // Construct Overpass QL query
  let overpassQuery = `[out:json][timeout:25];
    node(around:${radius},${lat},${lon})["leisure"="playground"];
    out body;`;

  // Add filters if any
  let filters: string[] = [];
  
  // Equipment filters
  if (slide === 'yes') filters.push(`["playground:slide"="yes"]`);
  if (slideDoubleDeck === 'yes') filters.push(`["playground:slide:double_deck"="yes"]`);
  if (swing === 'yes') filters.push(`["playground:swing"="yes"]`);
  if (seesaw === 'yes') filters.push(`["playground:seesaw"="yes"]`);
  if (climb === 'yes') filters.push(`["playground:climb"="yes"]`);
  if (climbingNet === 'yes') filters.push(`["playground:climbing_net"="yes"]`);
  if (slider === 'yes') filters.push(`["playground:slider"="yes"]`);
  if (music === 'yes') filters.push(`["playground:music"="yes"]`);
  if (bench === 'yes') filters.push(`["bench"="yes"]`);
  
  // Facility filters
  if (covered === 'yes') filters.push(`["covered"="yes"]`);
  if (naturalShade === 'yes') filters.push(`["natural_shade"="yes"]`);
  if (drinkingWater === 'yes') filters.push(`["drinking_water"="yes"]`);
  if (wheelchair === 'yes') filters.push(`["wheelchair"="yes"]`);
  
  // Age filters
  if (minAge) filters.push(`["min_age"="${minAge}"]`);
  if (maxAge) filters.push(`["max_age"="${maxAge}"]`);
  
  // Surface filter
  if (surface) filters.push(`["surface"="${surface}"]`);
  
  // Theme filter
  if (theme) filters.push(`["playground:theme"="${theme}"]`);

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

