"use client";
import { Plus, MapPin } from "lucide-react";

interface HeaderProps {
  onAddNewPark?: () => void;
}

export default function Header({ onAddNewPark }: HeaderProps) {
  const handleAddNewPark = () => {
    if (onAddNewPark) {
      onAddNewPark();
    } else {
      // Default behavior - you can customize this
      alert("Funcionalidade de adicionar parque em desenvolvimento!");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Playpark</h1>
          </div>

          {/* Right side - Add New Park Button */}
          <button
            onClick={handleAddNewPark}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Parque
          </button>
        </div>
      </div>
    </header>
  );
}
