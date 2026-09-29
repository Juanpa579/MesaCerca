"use client";

import { SlidersHorizontal, X, Star } from "lucide-react";

interface RestaurantFiltersProps {
  cuisines: string[];
  selectedCuisines: string[];
  selectedPrices: string[];
  onCuisineChange: (cuisine: string) => void;
  onPriceChange: (price: string) => void;
  onClear: () => void;
  selectedFilter?: string;
  onFilterSelect?: (filter: string) => void;
  showForYouButton?: boolean;
}

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

export function RestaurantFilters({
  cuisines,
  selectedCuisines,
  selectedPrices,
  onCuisineChange,
  onPriceChange,
  onClear,
  selectedFilter,
  onFilterSelect,
  showForYouButton,
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

      {/* Filtros en fila horizontal */}
      <div className="mt-5 flex flex-col gap-3">
        
        {/* Toggle Para ti / Todas */}
        {showForYouButton && onFilterSelect && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">Vista</span>
            <button
              type="button"
              onClick={() => onFilterSelect("para-ti")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedFilter === "para-ti"
                  ? "border border-orange-500 bg-orange-500 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Star className="h-4 w-4" />
              Para ti
            </button>

            <button
              type="button"
              onClick={() => onFilterSelect("todas")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedFilter === "todas"
                  ? "border border-orange-500 bg-orange-500 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              Todas
            </button>
          </div>
        )}

        <div className="h-px bg-slate-100" />

        {/* Filtro por Cocina - horizontal */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-900">Cocina</h3>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => onCuisineChange(cuisine)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCuisines.includes(cuisine)
                    ? "border border-orange-500 bg-orange-500 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Precio - horizontal */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-900">Precio</h3>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => onPriceChange(price)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedPrices.includes(price)
                    ? "border border-orange-500 bg-orange-500 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
