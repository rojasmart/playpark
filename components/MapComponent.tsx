"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { X, Star, MapPin, Clock, Users } from "lucide-react";

interface Playground {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  tags?: {
    [key: string]: string;
  };
}

function MapComponent({ playgrounds }: { playgrounds: Playground[] }) {
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // This is necessary for the icons in SSR
    import("leaflet").then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const handleMarkerClick = (playground: Playground) => {
    setSelectedPlayground(playground);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPlayground(null);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "slide":
        return <span className="text-lg">🛝</span>;
      case "slide_double_deck":
        return <span className="text-lg">🏗️</span>;
      case "swing":
        return <span className="text-lg">🪃</span>;
      case "seesaw":
        return <span className="text-lg">⚖️</span>;
      case "climb":
        return <span className="text-lg">🧗</span>;
      case "climbing_net":
        return <span className="text-lg">🕷️</span>;
      case "bench":
        return <span className="text-lg">🪑</span>;
      case "covered":
        return <span className="text-lg">☂️</span>;
      case "natural_shade":
        return <span className="text-lg">🌳</span>;
      case "drinking_water":
        return <span className="text-lg">🚰</span>;
      case "wheelchair":
        return <span className="text-lg">♿</span>;
      case "surface":
        return <span className="text-lg">🏗️</span>;
      case "theme":
        return <span className="text-lg">🎨</span>;
      case "age":
        return <span className="text-lg">👶</span>;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getAmenities = (tags: { [key: string]: string } = {}) => {
    const amenities = [];
    if (tags["playground:slide"] === "yes") amenities.push({ name: "Escorrega" });
    if (tags["playground:slide:double_deck"] === "yes") amenities.push({ name: "Escorrega 2 Pisos" });
    if (tags["playground:swing"] === "yes") amenities.push({ name: "Baloiços" });
    if (tags["playground:seesaw"] === "yes") amenities.push({ name: "Balancé" });
    if (tags["playground:climb"] === "yes") amenities.push({ name: "Escalada" });
    if (tags["playground:climbing_net"] === "yes") amenities.push({ name: "Rede Arborismo" });
    if (tags["playground:slider"] === "yes") amenities.push({ name: "Slider" });
    if (tags["playground:music"] === "yes") amenities.push({ name: "Música" });
    if (tags["bench"] === "yes") amenities.push({ name: "Bancos" });
    if (tags["covered"] === "yes") amenities.push({ name: "Coberto" });
    if (tags["natural_shade"] === "yes") amenities.push({ name: "Sombra c/ Árvores" });
    if (tags["drinking_water"] === "yes") amenities.push({ name: "Água potável" });
    if (tags["wheelchair"] === "yes") amenities.push({ name: "Acessível" });
    if (tags["surface"]) amenities.push({ name: `Superfície: ${tags.surface}` });
    if (tags["playground:theme"]) amenities.push({ name: `Tema: ${tags["playground:theme"]}` });
    if (tags["min_age"]) amenities.push({ name: `Idade mín: ${tags.min_age} anos` });
    if (tags["max_age"]) amenities.push({ name: `Idade máx: ${tags.max_age} anos` });
    return amenities;
  };

  return (
    <div className="relative">
      <MapContainer center={[38.7169, -9.139]} zoom={13} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {playgrounds?.map((playground) => (
          <Marker
            key={playground.id}
            position={[playground.lat, playground.lon]}
            eventHandlers={{
              click: () => handleMarkerClick(playground),
            }}
          >
            <Popup>{playground.name || "Parque Infantil"}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* App Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-2xl transform transition-transform duration-300 z-[1000] ${
          isDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        {selectedPlayground && (
          <div className="p-6 overflow-y-auto max-h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedPlayground.name || "Parque infantil"}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {selectedPlayground.lat.toFixed(4)}, {selectedPlayground.lon.toFixed(4)}
                  </span>
                </div>
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Photo placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Foto não disponível</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="ml-2 text-gray-600 text-sm">4.0 (baseado em dados OSM)</span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedPlayground.tags?.description ||
                  "Parque infantil localizado na área de Lisboa. Ideal para crianças brincarem e se divertirem num ambiente seguro."}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Comodidades</h3>
              <div className="grid grid-cols-2 gap-3">
                {getAmenities(selectedPlayground.tags).map((amenity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{amenity.name}</span>
                  </div>
                ))}
                {getAmenities(selectedPlayground.tags).length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-4">Informações sobre comodidades não disponíveis</div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4">
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Aberto 24h</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">Adequado para todas as idades</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black/60 z-[999]" onClick={closeDrawer} />}
    </div>
  );
}

export default MapComponent;
