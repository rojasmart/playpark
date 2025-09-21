"use client";
import { useEffect, useState } from "react";
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

  const fetchPlaygrounds = async () => {
    try {
      const params = new URLSearchParams(filters);

      // 1) Dados OSM (via rota existente)
      const resOSM = await fetch(`/api/playgrounds?${params.toString()}`);
      let osmNodes: Playground[] = [];
      if (resOSM.ok) {
        const data = await resOSM.json();
        osmNodes = (data.elements || []).map((el: any) => ({
          id: el.id,
          lat: Number(el.lat),
          lon: Number(el.lon),
          name: el.tags?.name,
          description: el.tags?.description,
          images: [],
          tags: el.tags,
          // @ts-ignore
          source: "osm",
        }));
      } else {
        console.warn("OSM fetch failed:", resOSM.status);
      }

      // 2) Pontos locais (backend) — mapeamento robusto para vários formatos
      const resLocal = await fetch(`/api/points`);
      let localNodes: Playground[] = [];
      if (resLocal.ok) {
        const localData = await resLocal.json();
        console.debug("local points raw:", localData);

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

      // 3) Mesclar (colocar locais primeiro para priorizar) e aplicar filtros de busca
      const nodes = [...localNodes, ...osmNodes];
      console.debug("merged playground nodes:", nodes);
      setAllPlaygrounds(nodes);
      filterPlaygroundsBySearch(nodes, searchQuery);
    } catch (err) {
      console.error("Erro ao buscar playgrounds:", err);
    }
  };

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

  useEffect(() => {
    fetchPlaygrounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50">
      <Header onAddNewPark={handleAddNewPark} onSearch={handleSearch} onShowFavorites={handleShowFavorites} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Map playgrounds={playgrounds} />
        </div>
      </main>
      <FloatingInfoButton onShowInfo={handleShowInfo} />
    </div>
  );
}
