"use client";

import { SlidersHorizontal, X } from "lucide-react";

interface RestaurantFiltersProps {
  cuisines: string[];
  selectedCuisines: string[];
  selectedPrices: string[];
  onCuisineChange: (cuisine: string) => void;
  onPriceChange: (price: string) => void;
  onClear: () => void;
}

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

export function RestaurantFilters({
  cuisines,
  selectedCuisines,
  selectedPrices,
  onCuisineChange,
  onPriceChange,
  onClear,
}: RestaurantFiltersProps) {
  const hasFilters =
    selectedCuisines.length > 0 || selectedPrices.length > 0;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-orange-500" />

          <h2 className="font-bold text-slate-900">
            Filtrar
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Cocina */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          Filtrar por Cocina
        </h3>

        <div className="mt-3 space-y-2">
          {cuisines.map((cuisine) => (
            <label
              key={cuisine}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedCuisines.includes(cuisine)}
                onChange={() => onCuisineChange(cuisine)}
                className="h-4 w-4 rounded accent-orange-500"
              />

              <span>{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          Filtrar por Rango de Precios
        </h3>

        <div className="mt-3 space-y-2">
          {PRICE_RANGES.map((price) => (
            <label
              key={price}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedPrices.includes(price)}
                onChange={() => onPriceChange(price)}
                className="h-4 w-4 rounded accent-orange-500"
              />

              <span>{price}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}