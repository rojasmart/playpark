import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "38.7169";
  const lon = searchParams.get("lon") || "-9.1390";
  const radius = searchParams.get("radius") || "5000";

  // Equipment filters
  const slide = searchParams.get("playground:slide") || null;
  const slideDoubleDeck = searchParams.get("playground:slide:double_deck") || null;
  const swing = searchParams.get("playground:swing") || null;
  const seesaw = searchParams.get("playground:seesaw") || null;
  const climb = searchParams.get("playground:climb") || null;
  const climbingNet = searchParams.get("playground:climbing_net") || null;
  const slider = searchParams.get("playground:slider") || null;
  const music = searchParams.get("playground:music") || null;
  const bench = searchParams.get("bench") || null;

  // Facility filters
  const covered = searchParams.get("covered") || null;
  const naturalShade = searchParams.get("natural_shade") || null;
  const drinkingWater = searchParams.get("drinking_water") || null;
  const wheelchair = searchParams.get("wheelchair") || null;
  const lit = searchParams.get("lit") || null;

  // Age filters
  const minAge = searchParams.get("min_age") || null;
  const maxAge = searchParams.get("max_age") || null;

  // Surface and theme filters
  const surface = searchParams.get("surface") || null;
  const theme = searchParams.get("playground:theme") || null;

  // Rating filter
  const rating = searchParams.get("rating") || null;

  // Construct Overpass QL query - optimized with bbox and reduced timeout
  // Calculate bounding box from radius (more efficient than 'around')
  const radiusNum = parseInt(radius);
  const latDelta = radiusNum / 111320; // degrees latitude
  const lonDelta = radiusNum / (111320 * Math.cos((parseFloat(lat) * Math.PI) / 180)); // degrees longitude
  
  const bbox = {
    south: parseFloat(lat) - latDelta,
    west: parseFloat(lon) - lonDelta,
    north: parseFloat(lat) + latDelta,
    east: parseFloat(lon) + lonDelta,
  };

  // Simplified query with shorter timeout and only nodes (much faster, avoids 504 errors)
  let overpassQuery = `[out:json][timeout:15][bbox:${bbox.south},${bbox.west},${bbox.north},${bbox.east}];
(
  node["leisure"="playground"];
);
out body center;`;

  // Add filters if any
  let filters: string[] = [];

  // Equipment filters
  if (slide === "yes") filters.push(`["playground:slide"="yes"]`);
  if (slideDoubleDeck === "yes") filters.push(`["playground:slide:double_deck"="yes"]`);
  if (swing === "yes") filters.push(`["playground:swing"="yes"]`);
  if (seesaw === "yes") filters.push(`["playground:seesaw"="yes"]`);
  if (climb === "yes") filters.push(`["playground:climb"="yes"]`);
  if (climbingNet === "yes") filters.push(`["playground:climbing_net"="yes"]`);
  if (slider === "yes") filters.push(`["playground:slider"="yes"]`);
  if (music === "yes") filters.push(`["playground:music"="yes"]`);
  if (bench === "yes") filters.push(`["bench"="yes"]`);

  // Facility filters
  if (covered === "yes") filters.push(`["covered"="yes"]`);
  if (naturalShade === "yes") filters.push(`["natural_shade"="yes"]`);
  if (drinkingWater === "yes") filters.push(`["drinking_water"="yes"]`);
  if (wheelchair === "yes") filters.push(`["wheelchair"="yes"]`);
  if (lit === "yes") filters.push(`["lit"="yes"]`);

  // Age filters
  if (minAge) filters.push(`["min_age"="${minAge}"]`);
  if (maxAge) filters.push(`["max_age"="${maxAge}"]`);

  // Surface filter
  if (surface) filters.push(`["surface"="${surface}"]`);

  // Theme filter
  if (theme) filters.push(`["playground:theme"="${theme}"]`);

  // Rating filter - For OSM, we'll use the 'stars' tag which is commonly used for ratings
  if (rating) {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 1 && ratingNum <= 5) {
      // Filter playgrounds with rating >= specified value
      filters.push(`["stars">="${ratingNum}"]`);
    }
  }

  if (filters.length > 0) {
    const filterStr = filters.join("");
    overpassQuery = `[out:json][timeout:15][bbox:${bbox.south},${bbox.west},${bbox.north},${bbox.east}];
(
  node["leisure"="playground"]${filterStr};
);
out body center;`;
  }

  console.log('Overpass Query:', overpassQuery);
  console.log('Search params:', { 
    lat, 
    lon, 
    radius: `${radius}m (${(parseInt(radius)/1000).toFixed(1)}km)`,
    bbox: bbox,
  });
  // Attempt Overpass queries using multiple mirrors with timeouts.
  // If the full-bbox query fails on all mirrors, subdivide the bbox and
  // query tiles (merge/dedupe results).
  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.openstreetmap.fr/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  async function fetchMirror(url: string, q: string, timeoutMs = 10000) {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: q,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      clearTimeout(to);
      if (!res.ok) {
        console.warn(`Overpass mirror ${url} returned ${res.status}`);
        return null;
      }
      const data = await res.json().catch(err => {
        console.warn('Overpass JSON parse error from', url, err);
        return null;
      });
      return data;
    } catch (err: any) {
      clearTimeout(to);
      if (err.name === 'AbortError') {
        console.warn(`Overpass mirror ${url} timed out after ${timeoutMs}ms`);
      } else {
        console.warn(`Overpass mirror ${url} error:`, err && err.message ? err.message : err);
      }
      return null;
    }
  }

  // Try full bbox on each mirror
  for (const m of mirrors) {
    const result = await fetchMirror(m, overpassQuery, 10000);
    if (result && Array.isArray(result.elements)) {
      console.log(`Overpass: returning ${result.elements.length} elements from ${m}`);
      return NextResponse.json(result);
    }
  }

  // If full bbox failed, subdivide bbox into 4 tiles and query each tile
  console.warn('⚠️ Full-bbox Overpass attempts failed; trying subdivided tiles');

  const latMid = (bbox.south + bbox.north) / 2;
  const lonMid = (bbox.west + bbox.east) / 2;
  const tiles = [
    { south: bbox.south, west: bbox.west, north: latMid, east: lonMid }, // SW
    { south: bbox.south, west: lonMid, north: latMid, east: bbox.east }, // SE
    { south: latMid, west: bbox.west, north: bbox.north, east: lonMid }, // NW
    { south: latMid, west: lonMid, north: bbox.north, east: bbox.east }, // NE
  ];

  const merged: any[] = [];
  const seen = new Set<string>();

  for (const tile of tiles) {
    const tileQuery = `[out:json][timeout:10][bbox:${tile.south},${tile.west},${tile.north},${tile.east}];\n(\n  node["leisure"="playground"];\n);\nout body center;`;
    for (const m of mirrors) {
      const r = await fetchMirror(m, tileQuery, 8000);
      if (r && Array.isArray(r.elements) && r.elements.length > 0) {
        for (const el of r.elements) {
          const key = `${el.type}_${el.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(el);
          }
        }
        break; // proceed to next tile after successful mirror
      }
    }
  }

  if (merged.length > 0) {
    console.log(`Overpass subdivided queries returned ${merged.length} unique elements`);
    return NextResponse.json({ elements: merged });
  }

  console.warn('⚠️ All Overpass attempts failed or returned no elements; returning empty elements[]');
  return NextResponse.json({ elements: [] });
}
