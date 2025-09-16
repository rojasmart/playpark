"use client";
import { useEffect, useState } from "react";
import Map from "../components/Map";
import FilterPanel from "../components/FilterPanel";

interface Playground {
  id: number;
  lat: number;
  lon: number;
  name?: string;
}

export default function Home() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchPlaygrounds = async () => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/playgrounds?${params.toString()}`);
    const data = await res.json();
    const nodes = data.elements.map((el: any) => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      name: el.tags?.name,
    }));
    setPlaygrounds(nodes);
  };

  useEffect(() => {
    fetchPlaygrounds();
  }, [filters]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Playground Buddy</h1>
      <FilterPanel filters={filters} setFilters={setFilters} />
      <Map playgrounds={playgrounds} />
    </div>
  );
}
