"use client";

import { useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  deleteReview,
  type Review,
} from "@/services/reviewService";

interface RestaurantReviewCardProps {
  review: Review;
  onReviewDeleted: (reviewId: string) => void;
}

function formatReviewDate(
  timestamp: Review["creadoEn"],
): string {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(timestamp.toDate());
}

export function RestaurantReviewCard({
  review,
  onReviewDeleted,
}: RestaurantReviewCardProps) {
  const { user } = useAuth();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user?.uid === review.usuarioId;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar esta reseña?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      await deleteReview(review.restauranteId, review.id);

      onReviewDeleted(review.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la reseña.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">
            {review.usuarioNombre || "Usuario"}
          </h3>

          {review.creadoEn && (
            <p className="mt-1 text-xs text-slate-400">
              {formatReviewDate(review.creadoEn)}
            </p>
          )}
        </div>

        {/* Calificación */}
        <div
          className="flex shrink-0 items-center gap-0.5"
          aria-label={`Calificación: ${review.calificacion} de 5`}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const starNumber = index + 1;

            return (
              <Star
                key={starNumber}
                className={`h-4 w-4 ${
                  starNumber <= review.calificacion
                    ? "fill-orange-400 text-orange-400"
                    : "text-slate-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Comentario */}
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {review.comentario}
      </p>

      {/* Eliminar */}
      {isOwner && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {isDeleting
              ? "Eliminando..."
              : "Eliminar reseña"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </article>
  );
}
