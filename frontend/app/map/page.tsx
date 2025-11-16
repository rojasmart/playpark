"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { MapPin } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Playground {
  id: string | number;
  lat: number;
  lon: number;
  name?: string;
  tags?: {
    [key: string]: string;
  };
}

export default function PublicMapPage() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlaygrounds = useCallback(async (center?: { lat: number; lon: number }, zoom?: number) => {
    try {
      const centerLat = center?.lat || 38.7169;
      const centerLon = center?.lon || -9.139;
      const zoomLevel = zoom || 13;

      const calculateRadius = (z: number): number => {
        const baseRadius = (40075000 * Math.cos((centerLat * Math.PI) / 180)) / Math.pow(2, z + 8);
        const radius = baseRadius * 2.5;
        return Math.max(Math.min(radius, 100000), 1000);
      };

      const radius = calculateRadius(zoomLevel);

      const params = new URLSearchParams({
        lat: String(centerLat),
        lon: String(centerLon),
        radius: String(Math.round(radius)),
      });

      // Fetch from OSM
      const resOSM = await fetch(`/api/playgrounds?${params.toString()}`);
      let osmNodes: Playground[] = [];
      if (resOSM.ok) {
        const data = await resOSM.json();
        osmNodes = (data.elements || [])
          .map((el: any) => {
            let lat = el.lat;
            let lon = el.lon;

            if (!lat || !lon) {
              if (el.center) {
                lat = el.center.lat;
                lon = el.center.lon;
              } else if (el.bounds) {
                lat = (el.bounds.minlat + el.bounds.maxlat) / 2;
                lon = (el.bounds.minlon + el.bounds.maxlon) / 2;
              }
            }

            return {
              id: `osm_${el.id}`,
              lat: Number(lat),
              lon: Number(lon),
              name: el.tags?.name || "Parque Infantil",
              tags: el.tags,
            };
          })
          .filter((p: any) => p.lat && p.lon && !isNaN(p.lat) && !isNaN(p.lon));
      }

      // Fetch from local backend
      const resLocal = await fetch(`/api/points?${params.toString()}`);
      let localNodes: Playground[] = [];
      if (resLocal.ok) {
        const localData = await resLocal.json();

        const getCoords = (p: any) => {
          if (p.location?.type === "Point" && Array.isArray(p.location.coordinates) && p.location.coordinates.length >= 2) {
            return { lat: Number(p.location.coordinates[1]), lon: Number(p.location.coordinates[0]) };
          }
          if (!isNaN(Number(p.lat)) && !isNaN(Number(p.lon))) {
            return { lat: Number(p.lat), lon: Number(p.lon) };
          }
          return null;
        };

        localNodes = (localData || [])
          .map((p: any) => {
            const coords = getCoords(p);
            if (!coords) return null;
            return {
              id: p._id ? `local_${p._id}` : `local_${Math.random().toString(36).slice(2, 9)}`,
              lat: coords.lat,
              lon: coords.lon,
              name: p.name || "Parque Infantil",
              tags: p.tags || {},
            };
          })
          .filter(Boolean) as Playground[];
      }

      const nodes = [...localNodes, ...osmNodes];
      setPlaygrounds(nodes);
    } catch (err) {
      console.error("Erro ao buscar playgrounds:", err);
    }
  }, []);

  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }, zoom: number, center: { lat: number; lon: number }) => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        fetchPlaygrounds(center, zoom);
      }, 500);
    },
    [fetchPlaygrounds]
  );

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-[#C91C1C]" />
              <h1 className="text-xl font-bold text-[#C91C1C]">Playpark</h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-[#C91C1C] transition-colors text-sm">
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-[#C91C1C] text-white px-6 py-2 rounded-lg hover:bg-[#A01515] transition-colors text-sm font-medium"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Map */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            <Map playgrounds={playgrounds} onBoundsChange={handleBoundsChange} />
          </div>
        </div>
      </main>

      {/* Info Banner */}
      <div className="bg-[#C91C1C] text-white py-3 px-4 text-center">
        <p className="text-sm">
          🎯{" "}
          <Link href="/register" className="underline font-semibold">
            Crie uma conta grátis
          </Link>{" "}
          para acessar filtros, favoritos e conquistar badges!
        </p>
      </div>
    </div>
  );
}
