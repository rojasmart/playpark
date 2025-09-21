"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Interface para os playgrounds (aceita id string ou number)
interface Playground {
  id: string | number;
  lat: number;
  lon: number;
  // adiciona lng porque alguns componentes esperam 'lng'
  lng?: number;
  name?: string;
  tags?: {
    [key: string]: string;
  };
}

// Importa o componente do mapa dinamicamente com SSR desativado
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false, // Isso é crucial - desativa a renderização no servidor
  loading: () => <div className="h-80vh w-full flex items-center justify-center bg-gray-100">Carregando mapa...</div>,
});

export default function Map({ playgrounds }: { playgrounds: Playground[] }) {
  // Normaliza os pontos para garantir lat/lon/lng numéricos e ids válidos
  const normalized = (playgrounds || [])
    .map((p) => {
      const lat = Number(p.lat);
      const lon = Number(p.lon ?? p.lng);
      const lng = Number((p as any).lng ?? p.lon ?? lon);
      return {
        ...p,
        lat,
        lon,
        lng,
        id: p.id,
      } as Playground;
    })
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lon));

  // debug rápido para verificar os pontos recebidos
  useEffect(() => {
    console.debug("Map incoming playgrounds:", normalized);
  }, [playgrounds]);

  return <MapWithNoSSR playgrounds={normalized} />;
}
