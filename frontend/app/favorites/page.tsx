"use client";
import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Trash2, Navigation } from "lucide-react";
import Link from "next/link";

interface Playground {
  id: string;
  name: string;
  lat: number;
  lon: number;
  description?: string;
  images?: string[];
  rating?: number;
  ratingCount?: number;
  tags?: Record<string, any>;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem("playpark_favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem("playpark_favorites", JSON.stringify(updatedFavorites));
  };

  const openInMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <MapPin className="w-8 h-8 text-[#C91C1C]" />
                <h1 className="text-xl font-bold text-[#C91C1C]">Playpark</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <h2 className="text-lg font-semibold text-gray-700">Favoritos</h2>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-[#C91C1C] transition-colors">
              ← Voltar ao Mapa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Parques Favoritos</h1>
              <p className="mt-2 text-gray-600">
                {favorites.length === 0
                  ? "Ainda não tem parques favoritos"
                  : `${favorites.length} ${favorites.length === 1 ? "parque guardado" : "parques guardados"}`}
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-500 mb-6">Comece a adicionar parques aos favoritos para vê-los aqui!</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#C91C1C] hover:bg-[#A01515] transition-colors"
            >
              Explorar Parques
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((playground) => (
              <div
                key={playground.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {playground.images && playground.images.length > 0 ? (
                    <img src={playground.images[0]} alt={playground.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(playground.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    aria-label="Remover dos favoritos"
                  >
                    <Heart className="w-5 h-5 text-[#C91C1C] fill-[#C91C1C]" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{playground.name || "Parque Infantil"}</h3>

                  {/* Rating */}
                  {playground.rating && playground.rating > 0 && (
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">
                        {playground.rating.toFixed(1)}
                        {playground.ratingCount && ` (${playground.ratingCount})`}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {playground.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{playground.description}</p>}

                  {/* Tags */}
                  {playground.tags && Object.keys(playground.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Object.entries(playground.tags)
                        .filter(([key, value]) => value === "yes" || value === true)
                        .slice(0, 3)
                        .map(([key]) => (
                          <span key={key} className="px-2 py-1 text-xs font-medium bg-[#C91C1C] bg-opacity-10 text-white rounded">
                            {key.replace("playground:", "").replace(/_/g, " ")}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openInMaps(playground.lat, playground.lon)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-[#C91C1C] text-sm font-medium rounded-md text-[#C91C1C] bg-white hover:bg-[#C91C1C] hover:text-white transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navegar
                    </button>
                    <button
                      onClick={() => removeFavorite(playground.id)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
