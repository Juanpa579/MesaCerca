"use client";

import { useMemo, useState } from "react";

import type { RestaurantProfile } from "@/services/restaurantService";
import { getCuisineCategories } from "@/services/restaurantService";

import { RestaurantCard } from "./RestaurantCard";
import { RestaurantFilters } from "./RestaurantFilters";

interface RestaurantExplorerProps {
  restaurants: RestaurantProfile[];
}

export function RestaurantExplorer({
  restaurants,
}: RestaurantExplorerProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  const cuisines = useMemo(
    () => getCuisineCategories(restaurants),
    [restaurants],
  );

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const cuisineMatches =
        selectedCuisines.length === 0 ||
        selectedCuisines.includes(restaurant.tipoCocina);

      const priceMatches =
        selectedPrices.length === 0 ||
        selectedPrices.includes(restaurant.rangoPrecios);

      return cuisineMatches && priceMatches;
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

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <RestaurantFilters
        cuisines={cuisines}
        selectedCuisines={selectedCuisines}
        selectedPrices={selectedPrices}
        onCuisineChange={toggleCuisine}
        onPriceChange={togglePrice}
        onClear={clearFilters}
      />

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Restaurantes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredRestaurants.length}{" "}
            {filteredRestaurants.length === 1
              ? "restaurante encontrado"
              : "restaurantes encontrados"}
          </p>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.uid}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No encontramos restaurantes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Prueba quitando alguno de los filtros seleccionados.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}