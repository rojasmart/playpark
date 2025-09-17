"use client";
import { useEffect, useState } from "react";
import Map from "../components/Map";
import FilterPanel from "../components/FilterPanel";
import Header from "../components/Header";

interface Playground {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  tags?: {
    [key: string]: string;
  };
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
      tags: el.tags,
    }));
    setPlaygrounds(nodes);
  };

  useEffect(() => {
    fetchPlaygrounds();
  }, [filters]);

  const handleAddNewPark = () => {
    // TODO: Implement add new park functionality
    console.log("Add new park clicked");
    // You can add modal, navigate to form, etc.
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddNewPark={handleAddNewPark} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Map playgrounds={playgrounds} />
        </div>
      </main>
    </div>
  );
}
