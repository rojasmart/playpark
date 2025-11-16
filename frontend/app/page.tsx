"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Map from "../components/Map";
import FilterPanel from "../components/FilterPanel";
import Header from "../components/Header";
import FloatingInfoButton from "../components/FloatingInfoButton";

interface Playground {
  id: string | number;
  lat: number;
  lon: number;
  name?: string;
  tags?: {
    [key: string]: string;
  };
}

export default function Home() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [allPlaygrounds, setAllPlaygrounds] = useState<Playground[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialFetchRef = useRef(false);

  const fetchPlaygrounds = useCallback(
    async (center?: { lat: number; lon: number }, zoom?: number, bounds?: { north: number; south: number; east: number; west: number }) => {
      try {
        // Use provided center or default to Lisbon
        const centerLat = center?.lat || 38.7169;
        const centerLon = center?.lon || -9.139;
        const zoomLevel = zoom || 13;

        // Calculate radius based on zoom level for better coverage
        const calculateRadius = (z: number): number => {
          // More generous radius calculation
          // Zoom levels: 10=~50km, 12=~20km, 13=~10km, 15=~5km, 17=~2km
          const baseRadius = (40075000 * Math.cos((centerLat * Math.PI) / 180)) / Math.pow(2, z + 8);

          // Multiply by factor to ensure good coverage (viewport diagonal + buffer)
          const radius = baseRadius * 2.5;

          // Ensure minimum 1km and maximum 100km
          return Math.max(Math.min(radius, 100000), 1000);
        };

        const radius = calculateRadius(zoomLevel);

        console.log("=== FETCHING PLAYGROUNDS ===");
        console.log("Center:", centerLat.toFixed(4), centerLon.toFixed(4));
        console.log("Zoom:", zoomLevel);
        console.log("Radius:", (radius / 1000).toFixed(1), "km");
        if (bounds) {
          console.log("Bounds:", {
            north: bounds.north.toFixed(4),
            south: bounds.south.toFixed(4),
            east: bounds.east.toFixed(4),
            west: bounds.west.toFixed(4),
          });
        }

        const params = new URLSearchParams({
          ...filters,
          lat: String(centerLat),
          lon: String(centerLon),
          radius: String(Math.round(radius)),
        });

        // 1) Dados OSM (via rota existente)
        const resOSM = await fetch(`/api/playgrounds?${params.toString()}`);
        let osmNodes: Playground[] = [];
        if (resOSM.ok) {
          const data = await resOSM.json();
          console.log("OSM API response:", data.elements?.length || 0, "elements");

          osmNodes = (data.elements || [])
            .map((el: any) => {
              // Handle different OSM element types (node, way, relation)
              let lat = el.lat;
              let lon = el.lon;

              // For ways and relations, use center coordinates if available
              if (!lat || !lon) {
                if (el.center) {
                  lat = el.center.lat;
                  lon = el.center.lon;
                } else if (el.bounds) {
                  // Calculate center from bounds
                  lat = (el.bounds.minlat + el.bounds.maxlat) / 2;
                  lon = (el.bounds.minlon + el.bounds.maxlon) / 2;
                }
              }

              return {
                id: `osm_${el.id}`,
                lat: Number(lat),
                lon: Number(lon),
                name: el.tags?.name || "Parque Infantil",
                description: el.tags?.description,
                images: el.tags?.image ? [el.tags.image] : [],
                tags: el.tags,
                // @ts-ignore
                source: "osm",
              };
            })
            .filter((p: any) => p.lat && p.lon && !isNaN(p.lat) && !isNaN(p.lon));

          console.log("OSM playgrounds processed:", osmNodes.length);
        } else {
          console.warn("OSM fetch failed:", resOSM.status);
        }

        // 2) Pontos locais (backend) — mapeamento robusto para vários formatos
        // Pass location parameters to backend
        const backendParams = new URLSearchParams({
          lat: String(centerLat),
          lon: String(centerLon),
          radius: String(Math.round(radius)),
        });
        const resLocal = await fetch(`/api/points?${backendParams.toString()}`);
        let localNodes: Playground[] = [];
        if (resLocal.ok) {
          const localData = await resLocal.json();
          console.log("Backend API response:", Array.isArray(localData) ? localData.length : 0, "points");

          const getCoords = (p: any) => {
            // 1) GeoJSON em 'location' (GeoJSON Point): coordinates = [lon, lat]
            if (p.location?.type === "Point" && Array.isArray(p.location.coordinates) && p.location.coordinates.length >= 2) {
              return { lat: Number(p.location.coordinates[1]), lon: Number(p.location.coordinates[0]) };
            }

            // 2) GeoJSON em 'geometry'
            if (p.geometry?.type === "Point" && Array.isArray(p.geometry.coordinates) && p.geometry.coordinates.length >= 2) {
              return { lat: Number(p.geometry.coordinates[1]), lon: Number(p.geometry.coordinates[0]) };
            }

            // 3) Document model { location: { lat, lng } }
            if (p.location && !isNaN(Number(p.location.lat)) && !isNaN(Number(p.location.lng))) {
              return { lat: Number(p.location.lat), lon: Number(p.location.lng) };
            }

            // 4) Campos planos lat / lon
            if (!isNaN(Number(p.lat)) && !isNaN(Number(p.lon))) {
              return { lat: Number(p.lat), lon: Number(p.lon) };
            }

            // 5) coordinates array [lon, lat]
            if (Array.isArray(p.coordinates) && p.coordinates.length >= 2) {
              return { lat: Number(p.coordinates[1]), lon: Number(p.coordinates[0]) };
            }

            // 6) fallback: sometimes stored as {lat: "x", lng: "y"} or {lat, lon}
            if (p.location && (p.location.lat || p.location.lng || p.location.lon)) {
              const lat = Number(p.location.lat);
              const lon = Number(p.location.lng ?? p.location.lon);
              if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
            }

            return null;
          };

          const normalizeTags = (t: any) => {
            if (!t) return {};
            if (Array.isArray(t)) return { list: t.map(String) };
            if (typeof t === "object") return t;
            return { value: String(t) };
          };

          localNodes = (localData || [])
            .map((p: any) => {
              const coords = getCoords(p);
              if (!coords) return null;
              return {
                id: p._id ? `local_${p._id}` : `local_${Math.random().toString(36).slice(2, 9)}`,
                lat: coords.lat,
                lon: coords.lon,
                name: p.name || p.title || p.description || "Parque Infantil",
                description: p.description || p.appData?.description,
                images: Array.isArray(p.appData?.images)
                  ? p.appData.images.map((img: any) => img.url).filter(Boolean)
                  : Array.isArray(p.images)
                  ? p.images.map((i: any) => (typeof i === "string" ? i : i.url)).filter(Boolean)
                  : [],
                tags: normalizeTags(p.tags || p.appData?.tags || p.tags),
                // @ts-ignore
                source: "local",
              } as Playground;
            })
            .filter(Boolean) as Playground[];
          console.log("[fetchPlaygrounds] localNodes count:", localNodes.length);
        } else {
          console.warn("Local points fetch failed:", resLocal.status);
        }

        // 3) Mesclar (colocar locais primeiro para priorizar)
        let nodes = [...localNodes, ...osmNodes];

        // Helper copied from MapComponent to interpret tag truthiness
        const isTruthyTag = (val: any) => {
          if (val === true) return true;
          if (typeof val === "string") {
            const v = val.toLowerCase();
            return v === "yes" || v === "true" || v === "1";
          }
          if (typeof val === "number") return val === 1;
          return false;
        };

        // Apply UI filters (from FilterPanel) to the merged nodes list so both OSM and local points respect selections
        const matchesFilters = (p: Playground) => {
          // If no filters set, always match
          if (!filters || Object.keys(filters).length === 0) return true;

          // For each active filter key where value is non-empty, verify playground has tag matching truthy value
          for (const [key, val] of Object.entries(filters)) {
            if (!val || val === "") continue; // skip empty filters

            // Special-case radius/min/max handled server-side — skip if key is lat/lon/radius
            if (key === "lat" || key === "lon" || key === "radius") continue;

            const desired = val.toLowerCase();

            // For boolean equipment/facility filters we expect "yes" in UI
            if (desired === "yes") {
              // The playground tags may be in different shapes: tags object, appData.tags, or simple map
              const tags = p.tags || {};

              // Some local points store boolean flags in tags or in appData; try multiple key variants
              const candidates = [
                tags[key],
                tags[key.replace(/:/g, "_")], // playground:slide -> playground_slide
                tags[`${key}_yes`],
                tags[`${key}_true`],
                tags[`${key}_1`],
              ];

              const foundTruthy = candidates.some((c) => isTruthyTag(c));
              if (!foundTruthy) return false;
            } else {
              // For non-boolean filters, do a direct string match if tag exists
              const tags = p.tags || {};
              if (!tags[key] || String(tags[key]).toLowerCase() !== desired) return false;
            }
          }

          return true;
        };

        // Filter nodes using UI filters
        nodes = nodes.filter(matchesFilters);
        console.log("=== PLAYGROUND SUMMARY ===");
        console.log("OSM nodes:", osmNodes.length);
        console.log("Local nodes:", localNodes.length);
        console.log("Total merged:", nodes.length);

        // Log coordinate ranges for debugging
        if (nodes.length > 0) {
          const lats = nodes.map((n) => n.lat);
          const lons = nodes.map((n) => n.lon);
          console.log("Coordinate ranges:");
          console.log("  Lat:", Math.min(...lats).toFixed(4), "to", Math.max(...lats).toFixed(4));
          console.log("  Lon:", Math.min(...lons).toFixed(4), "to", Math.max(...lons).toFixed(4));
        }

        setAllPlaygrounds(nodes);
        filterPlaygroundsBySearch(nodes, searchQuery);
      } catch (err) {
        console.error("Erro ao buscar playgrounds:", err);
      }
    },
    [filters, searchQuery]
  );

  const filterPlaygroundsBySearch = (playgroundsToFilter: Playground[], query: string) => {
    if (!query.trim()) {
      setPlaygrounds(playgroundsToFilter);
      return;
    }

    const filtered = playgroundsToFilter.filter((playground) => {
      const name = playground.name?.toLowerCase() || "";
      const searchTerm = query.toLowerCase();

      // Search by name
      if (name.includes(searchTerm)) return true;

      // Search by location/address if available in tags
      const location = playground.tags?.["addr:city"]?.toLowerCase() || "";
      const street = playground.tags?.["addr:street"]?.toLowerCase() || "";
      const suburb = playground.tags?.["addr:suburb"]?.toLowerCase() || "";

      return location.includes(searchTerm) || street.includes(searchTerm) || suburb.includes(searchTerm);
    });

    setPlaygrounds(filtered);
  };

  // Handle map bounds change with debouncing
  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }, zoom: number, center: { lat: number; lon: number }) => {
      console.log("Map bounds changed:", { bounds, zoom, center });

      // Debounce the fetch to avoid too many API calls
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        console.log("Triggering debounced fetch...");
        fetchPlaygrounds(center, zoom, bounds);
      }, 500);
    },
    [fetchPlaygrounds]
  );

  // Initial fetch on mount - removed because map will trigger it
  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Refetch when filters change
  useEffect(() => {
    // Only refetch if we've had an initial fetch
    if (hasInitialFetchRef.current) {
      // Use a small delay to debounce filter changes
      const timeout = setTimeout(() => {
        // Trigger re-fetch by simulating a map event (will use current map position)
        console.log("Filters changed, will refetch on next map interaction");
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [filters]);

  const handleAddNewPark = () => {
    console.log("Add new park clicked");
    // TODO: Implement add new park functionality
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPlaygroundsBySearch(allPlaygrounds, query);
  };

  const handleShowFavorites = () => {
    console.log("Show favorites clicked");
    // TODO: Implement favorites functionality
  };

  const handleShowInfo = () => {
    console.log("Show info clicked");
    // TODO: Implement info/about modal
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header onAddNewPark={handleAddNewPark} onSearch={handleSearch} onShowFavorites={handleShowFavorites} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            <Map playgrounds={playgrounds} onBoundsChange={handleBoundsChange} />
          </div>
        </div>
      </main>
      <FloatingInfoButton onShowInfo={handleShowInfo} />
    </div>
  );
}
