"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";

import {
  getRestaurants,
  type RestaurantProfile,
} from "@/services/restaurantService";

import { RestaurantCard } from "@/features/restaurant/components/RestaurantCard";

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los restaurantes.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  /*
   * Obtiene las categorías de cocina directamente de los restaurantes.
   *
   * Ejemplo:
   * ["Italiana", "Casera", "Mexicana", "Italiana"]
   *
   * termina convirtiéndose en:
   * ["Casera", "Italiana", "Mexicana"]
   */
  const cuisineCategories = useMemo(() => {
    const categories = restaurants
      .map((restaurant) => restaurant.tipoCocina.trim())
      .filter(Boolean);

    return Array.from(new Set(categories)).sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }, [restaurants]);

  /*
   * Aplica todos los filtros seleccionados.
   *
   * Los filtros dentro de una misma categoría funcionan como OR:
   *
   * Cocina:
   * Italiana OR Casera
   *
   * Precio:
   * $ OR $$
   *
   * Entre categorías funciona como AND:
   *
   * (Italiana OR Casera)
   * AND
   * ($ OR $$)
   */
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesCuisine =
        selectedCuisines.length === 0 ||
        selectedCuisines.includes(restaurant.tipoCocina.trim());

      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.includes(restaurant.rangoPrecios);

      return matchesCuisine && matchesPrice;
    });
  }, [restaurants, selectedCuisines, selectedPrices]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((current) =>
      current.includes(cuisine)
        ? current.filter((item) => item !== cuisine)
        : [...current, cuisine],
    );
  };

  const togglePrice = (price: string) => {
    setSelectedPrices((current) =>
      current.includes(price)
        ? current.filter((item) => item !== price)
        : [...current, price],
    );
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSelectedPrices([]);
  };

  const hasActiveFilters =
    selectedCuisines.length > 0 || selectedPrices.length > 0;

  return (
    <section className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Encuentra tu próximo restaurante
          </h1>

          <p className="mt-3 text-slate-600">
            Descubre restaurantes y encuentra el lugar perfecto para tu
            próxima comida.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span>Cargando restaurantes...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <h2 className="font-semibold">
                  No se pudieron cargar los restaurantes
                </h2>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido */}
        {!isLoading && !error && (
          <>
            {/* Filtros */}
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Filtrar restaurantes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Puedes seleccionar varias opciones al mismo tiempo.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {/* Cocina */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    Filtrar por Cocina
                  </p>

                  {cuisineCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cuisineCategories.map((cuisine) => {
                        const selected =
                          selectedCuisines.includes(cuisine);

                        return (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={() => toggleCuisine(cuisine)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                              selected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                          >
                            {selected && (
                              <Check className="h-4 w-4" />
                            )}

                            {cuisine}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No hay categorías de cocina disponibles.
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    Filtrar por Rango de Precios
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((price) => {
                      const selected = selectedPrices.includes(price);

                      return (
                        <button
                          key={price}
                          type="button"
                          onClick={() => togglePrice(price)}
                          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            selected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {selected && (
                            <Check className="h-4 w-4" />
                          )}

                          {price}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resumen */}
              {hasActiveFilters && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-600">
                    Mostrando{" "}
                    <span className="font-semibold text-slate-900">
                      {filteredRestaurants.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-slate-900">
                      {restaurants.length}
                    </span>{" "}
                    restaurantes.
                  </p>
                </div>
              )}
            </div>

            {/* Restaurantes */}
            {filteredRestaurants.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.uid}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {filteredRestaurants.length === 0 && (
                <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
                    <UtensilsCrossed className="h-12 w-12 text-slate-300" />

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    No encontramos restaurantes
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-slate-500">
                    No hay restaurantes que coincidan con los filtros seleccionados.
                    </p>

                    {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                    >
                        Limpiar filtros
                    </button>
                    )}
                </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}