"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Interface para os playgrounds
interface Playground {
  id: number;
  lat: number;
  lon: number; // Corrigido: removido o "lon:" duplicado
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

export default function Map({ playgrounds }) {
  return <MapWithNoSSR playgrounds={playgrounds} />;
}
