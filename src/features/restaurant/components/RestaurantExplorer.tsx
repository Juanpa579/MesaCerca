"use client";

import { useEffect, useMemo, useState } from "react";

import type { RestaurantProfile } from "@/services/restaurantService";
import { getCuisineCategories } from "@/services/restaurantService";
import type { Review } from "@/services/reviewService";

import type { Reservation } from "@/services/reservationService";
import { getUserReservations } from "@/services/reservationService";

import { useAuth } from "@/context/AuthContext";

import { RestaurantCard } from "./RestaurantCard";
import { RestaurantFilters } from "./RestaurantFilters";

interface RestaurantExplorerProps {
  restaurants: RestaurantProfile[];
}

/**
 * Calcula la calificación promedio a partir de un arreglo de reseñas.
 * Retorna 0 cuando el arreglo está vacío.
 */
function getCalificacionPromedio(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.calificacion),
    0,
  );

  return total / reviews.length;
}

/**
 * Calcula un ranking de recomendaciones basado en el historial de reservas.
 *
 * Prioriza restaurantes que coinciden con los tipos de cocina y rangos de precios
 * que el usuario ha reservado previamente. Empata por calificación promedio descendente.
 */
function getRecommendations(
  restaurants: RestaurantProfile[],
  reservations: Reservation[],
  reviewsByRestaurant: Map<string, number>,
): RestaurantProfile[] {
  if (!reservations || reservations.length === 0) {
    // Sin historial: ordenar por calificación promedio descendente
    return [...restaurants].sort((a, b) => {
      const ratingA = reviewsByRestaurant.get(a.uid) ?? 0;
      const ratingB = reviewsByRestaurant.get(b.uid) ?? 0;
      return ratingB - ratingA;
    });
  }

  // Construir mapa restauranteId -> datos del restaurante
  const restaurantMap = new Map<string, RestaurantProfile>();
  for (const restaurant of restaurants) {
    restaurantMap.set(restaurant.uid, restaurant);
  }

  // Calcular frecuencia de tipos de cocina y rangos de precios
  const cuisineFrequency: Record<string, number> = {};
  const priceFrequency: Record<string, number> = {};

  for (const reservation of reservations) {
    const restaurant = restaurantMap.get(reservation.restauranteId);
    if (restaurant) {
      const cuisine = restaurant.tipoCocina;
      const price = restaurant.rangoPrecios;

      if (cuisine) {
        cuisineFrequency[cuisine] = (cuisineFrequency[cuisine] ?? 0) + 1;
      }
      if (price) {
        priceFrequency[price] = (priceFrequency[price] ?? 0) + 1;
      }
    }
  }

  // Calcular score para cada restaurante
  const scoredRestaurants = restaurants.map((restaurant) => {
    const cuisineScore = cuisineFrequency[restaurant.tipoCocina] ?? 0;
    const priceScore = priceFrequency[restaurant.rangoPrecios] ?? 0;
    const rating = reviewsByRestaurant.get(restaurant.uid) ?? 0;

    // Score total: combinación de coincidencias de preferencias + calificación
    const preferenceScore = cuisineScore + priceScore;

    return {
      restaurant,
      preferenceScore,
      rating,
    };
  });

  // Ordenar: primero por preferenceScore descendente, luego por rating descendente
  scoredRestaurants.sort((a, b) => {
    if (b.preferenceScore !== a.preferenceScore) {
      return b.preferenceScore - a.preferenceScore;
    }
    return b.rating - a.rating;
  });

  return scoredRestaurants.map((item) => item.restaurant);
}

export function RestaurantExplorer({
  restaurants,
}: RestaurantExplorerProps) {
  const { user } = useAuth();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("todas");
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [recommendationError, setRecommendationError] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reviewsData, setReviewsData] = useState<Map<string, number>>(
    new Map(),
  );
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const isForYouMode = selectedFilter === "para-ti";

  const cuisines = useMemo(
    () => getCuisineCategories(restaurants),
    [restaurants],
  );

  // Cargar reviews de TODOS los restaurantes una sola vez (para usar en ranking y calificaciones)
  useEffect(() => {
    if (restaurants.length === 0) return;
    if (reviewsLoaded) return;

    let cancelled = false;

    async function loadAllReviews() {
      try {
        const reviewsService = await import("@/services/reviewService");
        const reviewsMap = new Map<string, number>();

        const loadPromises = restaurants.map(async (restaurant) => {
          try {
            const reviews = await reviewsService.getRestaurantReviews(
              restaurant.uid,
            );
            const avg = getCalificacionPromedio(reviews);
            reviewsMap.set(restaurant.uid, avg);
          } catch {
            // Ignorar errores individuales
          }
        });

        await Promise.all(loadPromises);

        if (!cancelled) {
          setReviewsData(new Map(reviewsMap));
          setReviewsLoaded(true);
        }
      } catch {
        // Ignorar errores
      }
    }

    loadAllReviews();

    return () => {
      cancelled = true;
    };
  }, [restaurants, reviewsLoaded]);

  // Cargar reservas del usuario cuando se activa "Para ti"
  useEffect(() => {
    if (!user) return;

    if (isForYouMode) {
      setIsLoadingReservations(true);
      getUserReservations(user.uid)
        .then((reservations) => {
          setUserReservations(reservations);
          setRecommendationError(false);
        })
        .catch((error) => {
          console.error(
            "Error al cargar reservas para recomendaciones:",
            error,
          );
          setRecommendationError(true);
        })
        .finally(() => {
          setIsLoadingReservations(false);
        });
    } else {
      setUserReservations([]);
      setRecommendationError(false);
    }
  }, [isForYouMode, user]);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;

    // Si estamos en modo "Para ti", aplicar el ranking de recomendaciones
    if (isForYouMode && reviewsLoaded) {
      result = getRecommendations(
        result,
        userReservations,
        reviewsData,
      );
    }

    // Aplicar filtros de cocina y precio sobre el resultado ya ordenado
    result = result.filter((restaurant) => {
      const cuisineMatches =
        selectedCuisines.length === 0 ||
        selectedCuisines.includes(restaurant.tipoCocina);

      const priceMatches =
        selectedPrices.length === 0 ||
        selectedPrices.includes(restaurant.rangoPrecios);

      return cuisineMatches && priceMatches;
    });

    return result;
  }, [
    restaurants,
    isForYouMode,
    userReservations,
    reviewsData,
    selectedCuisines,
    selectedPrices,
    reviewsLoaded,
  ]);

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

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <div className="flex flex-col gap-8">
      <RestaurantFilters
        cuisines={cuisines}
        selectedCuisines={selectedCuisines}
        selectedPrices={selectedPrices}
        onCuisineChange={toggleCuisine}
        onPriceChange={togglePrice}
        onClear={clearFilters}
        selectedFilter={isForYouMode ? "para-ti" : "todas"}
        onFilterSelect={handleFilterSelect}
        showForYouButton={user !== null}
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

        {/* Banner informativo: sin historial de reservas */}
        {isForYouMode &&
          !recommendationError &&
          !isLoadingReservations &&
          userReservations.length === 0 &&
          reviewsLoaded && (
            <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-800">
                Aún no tienes historial de reservas — te mostramos los más populares y mejor calificados.
                <span className="ml-2 text-xs font-medium text-orange-600">
                  Sin ubicación
                </span>
              </p>
            </div>
          )}

        {/* Banner de error: fallo al cargar recomendaciones */}
        {recommendationError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              No fue posible cargar tus recomendaciones. Te mostramos todos los restaurantes.
            </p>
          </div>
        )}

        {/* Loading de reservas */}
        {isLoadingReservations && (
          <div className="mb-6 flex items-center gap-3 text-sm text-slate-500">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Calculando recomendaciones...
          </div>
        )}

        {filteredRestaurants.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant, index) => {
              const rank = isForYouMode && !recommendationError ? index + 1 : 0;
              const calificacionDestacada =
                isForYouMode && !recommendationError
                  ? reviewsData.get(restaurant.uid) ?? 0
                  : 0;

              return (
                <RestaurantCard
                  key={restaurant.uid}
                  restaurant={restaurant}
                  rank={rank}
                  calificacionDestacada={calificacionDestacada}
                />
              );
            })}
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
