"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getRestaurants,
  type RestaurantProfile,
} from "@/services/restaurantService";

import dynamic from "next/dynamic";
import { RestaurantExplorer } from "@/features/restaurant/components/RestaurantExplorer";
import { useAuth } from "@/context/AuthContext";

const RestaurantMap = dynamic(
  () =>
    import("@/features/restaurant/components/RestaurantMap").then(
      (mod) => mod.RestaurantMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando mapa...
        </div>
      </div>
    ),
  },
);

export default function HomePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const restaurantsWithLocation = useMemo(() => {
    return restaurants.filter(
      (restaurant) =>
        typeof restaurant.latitud === "number" &&
        typeof restaurant.longitud === "number",
    );
  }, [restaurants]);

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
            {/* Mapa */}
            {restaurantsWithLocation.length > 0 && (
              <div className="mb-10">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Restaurantes en el mapa
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona un restaurante en el mapa para ver más información.
                  </p>
                </div>

                <RestaurantMap
                  restaurants={restaurantsWithLocation}
                />
              </div>
            )}

            {/* Explorer de restaurantes */}
            <RestaurantExplorer
              restaurants={restaurants}
            />
          </>
        )}
      </div>
    </section>
  );
}
