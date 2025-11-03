"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface FilterProps {
  filters: Record<string, string>;
  setFilters: (f: Record<string, string>) => void;
}

export default function FilterPanel({ filters, setFilters }: FilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setFilters({
      ...filters,
      [name]: type === "checkbox" ? (checked ? "yes" : "") : value,
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter((value) => value && value !== "").length;

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 mb-6">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-700 " />
            <h2 className="text-lg text-gray-500">Filtros</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeFiltersCount} ativo{activeFiltersCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
                Limpar tudo
              </button>
            )}
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-600">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? "Esconder filtros" : "Mostrar filtros"}
            </button>
          </div>
        </div>
      </div>

      {/* All Filters - Expandable */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Equipment */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Equipamentos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:slide"
                  checked={filters["playground:slide"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Escorrega</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:slide:double_deck"
                  checked={filters["playground:slide:double_deck"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Escorrega 2 Pisos</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:swing"
                  checked={filters["playground:swing"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Baloiços</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:seesaw"
                  checked={filters["playground:seesaw"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Balancé</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:climb"
                  checked={filters["playground:climb"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Rede</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:climbing_net"
                  checked={filters["playground:climbing_net"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Rede Arborismo</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:slider"
                  checked={filters["playground:slider"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Slider</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="playground:music"
                  checked={filters["playground:music"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Música</span>
              </label>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Avaliação</h3>
            <select
              name="rating"
              value={filters["rating"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Qualquer avaliação</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
              <option value="4">⭐⭐⭐⭐ (4+ estrelas)</option>
              <option value="3">⭐⭐⭐ (3+ estrelas)</option>
              <option value="2">⭐⭐ (2+ estrelas)</option>
              <option value="1">⭐ (1+ estrelas)</option>
            </select>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Comodidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="covered"
                  checked={filters["covered"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Coberto</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="natural_shade"
                  checked={filters["natural_shade"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Sombra c/ Árvores</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="drinking_water"
                  checked={filters["drinking_water"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Bebedouro</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="wheelchair"
                  checked={filters["wheelchair"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Acessível Cadeira Rodas</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="bench"
                  checked={filters["bench"] === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Bancos</span>
              </label>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Faixa etária</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Idade mínima</label>
                <select
                  name="min_age"
                  value={filters["min_age"] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Qualquer</option>
                  <option value="1">1 ano</option>
                  <option value="2">2 anos</option>
                  <option value="3">3 anos</option>
                  <option value="4">4 anos</option>
                  <option value="5">5 anos</option>
                  <option value="6">6 anos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Idade máxima</label>
                <select
                  name="max_age"
                  value={filters["max_age"] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Qualquer</option>
                  <option value="6">6 anos</option>
                  <option value="8">8 anos</option>
                  <option value="10">10 anos</option>
                  <option value="12">12 anos</option>
                  <option value="14">14 anos</option>
                  <option value="16">16 anos</option>
                  <option value="99">Sem limite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Surface Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de superfície</h3>
            <select
              name="surface"
              value={filters["surface"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Qualquer superfície</option>
              <option value="pebblestone">Pedra britada</option>
              <option value="sand">Areia</option>
              <option value="grass">Relva</option>
              <option value="rubber">Borracha</option>
              <option value="concrete">Betão</option>
              <option value="wood">Madeira</option>
              <option value="gravel">Gravilha</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tema</h3>
            <select
              name="playground:theme"
              value={filters["playground:theme"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Qualquer tema</option>
              <option value="car">Carros</option>
              <option value="airplane">Aviões</option>
              <option value="boat">Barcos</option>
              <option value="pirate">Piratas</option>
              <option value="castle">Castelo</option>
              <option value="nature">Natureza</option>
              <option value="space">Espaço</option>
              <option value="animals">Animais</option>
              <option value="adventure">Aventura</option>
              <option value="fantasy">Fantasia</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
