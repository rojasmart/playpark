"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// If you get type errors, ensure you have the correct versions of react-leaflet and @types/leaflet
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

interface Playground {
  id: number;
  lat: number;
  lon: number;
  name?: string;
}

function Map({ playgrounds }: { playgrounds: Playground[] }) {
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

  return (
    <MapContainer center={[38.7169, -9.139]} zoom={14} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // @ts-ignore
        attribution="&copy; OpenStreetMap contributors"
      />
      {playgrounds.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lon]}>
          <Popup>{p.name || "Parque infantil"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
