"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

import {
  getRestaurantReviews,
  type Review,
} from "@/services/reviewService";

import { RestaurantReviewForm } from "./RestaurantReviewForm";
import { RestaurantReviewCard } from "./RestaurantReviewCard";

interface RestaurantReviewProps {
  restauranteId: string;
}

export function RestaurantReview({
  restauranteId,
}: RestaurantReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const restaurantReviews =
        await getRestaurantReviews(restauranteId);

      setReviews(restaurantReviews);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las reseñas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [restauranteId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleReviewCreated = () => {
    loadReviews();
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((currentReviews) =>
      currentReviews.filter(
        (review) => review.id !== reviewId,
      ),
    );
  };

  return (
    <section className="space-y-6">
      {/* Título */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-500" />

          <h2 className="text-xl font-bold text-slate-900">
            Reseñas
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Conoce las experiencias de otros clientes.
        </p>
      </div>

      {/* Formulario */}
      <RestaurantReviewForm
        restauranteId={restauranteId}
        onReviewCreated={handleReviewCreated}
      />

      {/* Lista */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span>Cargando reseñas...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              Aún no hay reseñas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sé el primero en compartir tu experiencia.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <RestaurantReviewCard
                key={review.id}
                review={review}
                onReviewDeleted={handleReviewDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}