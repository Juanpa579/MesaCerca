"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
} from "lucide-react";

import {
  getRestaurantReviews,
  type Review,
} from "@/services/reviewService";

import { RestaurantReviewCard } from "./RestaurantReviewCard";

interface RestaurantReviewsProps {
  restauranteId: string;
}

export function RestaurantReviews({
  restauranteId,
}: RestaurantReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!restauranteId) {
      return;
    }

    let cancelled = false;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const restaurantReviews =
          await getRestaurantReviews(restauranteId);

        if (!cancelled) {
          setReviews(restaurantReviews);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Error al cargar las reseñas:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las reseñas.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [restauranteId]);

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((currentReviews) =>
      currentReviews.filter(
        (review) => review.id !== reviewId,
      ),
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-orange-500" />

          <h2 className="text-xl font-bold text-slate-900">
            Reseñas
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Consulta las opiniones que han dejado los clientes
          sobre tu restaurante.
        </p>
      </div>

      {/* Cargando */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />

            <span>
              Cargando reseñas...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Sin reseñas */}
      {!loading && !error && reviews.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Aún no hay reseñas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Cuando tus clientes dejen reseñas,
            aparecerán aquí.
          </p>
        </div>
      )}

      {/* Lista */}
      {!loading && !error && reviews.length > 0 && (
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
  );
}