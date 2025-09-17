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
  const [allPlaygrounds, setAllPlaygrounds] = useState<Playground[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    setAllPlaygrounds(nodes);
    filterPlaygroundsBySearch(nodes, searchQuery);
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
      <Header onAddNewPark={handleAddNewPark} onSearch={handleSearch} onShowFavorites={handleShowFavorites} onShowInfo={handleShowInfo} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Map playgrounds={playgrounds} />
        </div>
      </main>
    </div>
  );
}
