"use client";
import { Info } from "lucide-react";

interface FloatingInfoButtonProps {
  onShowInfo?: () => void;
}

export default function FloatingInfoButton({ onShowInfo }: FloatingInfoButtonProps) {
  const handleShowInfo = () => {
    if (onShowInfo) {
      onShowInfo();
    } else {
      alert("Sobre o Playpark - Encontre os melhores parques infantis da sua região!");
    }
  };

  return (
    <button
      onClick={handleShowInfo}
      className="fixed bottom-6 right-6 w-12 h-12 bg-red-700 hover:bg-red-800 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 z-[1001] flex items-center justify-center group"
      aria-label="Informações sobre o Playpark"
      title="Sobre"
    >
      <Info className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Sobre o Playpark
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </button>
  );
}
