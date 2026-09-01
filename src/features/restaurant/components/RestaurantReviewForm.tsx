"use client";

import { FormEvent, useState } from "react";
import { Loader2, Star } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  createReview,
  MAX_REVIEW_LENGTH,
} from "@/services/reviewService";

interface RestaurantReviewFormProps {
  restauranteId: string;
  onReviewCreated: () => void;
}

export function RestaurantReviewForm({
  restauranteId,
  onReviewCreated,
}: RestaurantReviewFormProps) {
  const { user } = useAuth();

  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");

  const [hoverRating, setHoverRating] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm text-slate-600">
          Debes iniciar sesión para escribir una reseña.
        </p>
      </div>
    );
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (calificacion < 1 || calificacion > 5) {
      setError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    if (!comentario.trim()) {
      setError("Escribe un comentario para tu reseña.");
      return;
    }

    if (comentario.trim().length > MAX_REVIEW_LENGTH) {
      setError(
        `La reseña no puede superar los ${MAX_REVIEW_LENGTH} caracteres.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        restauranteId,
        usuarioId: user.uid,
        usuarioNombre: user.name ?? "Usuario",
        calificacion,
        comentario: comentario.trim(),
      });

      setCalificacion(0);
      setComentario("");
      setHoverRating(0);

      onReviewCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo publicar la reseña. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedRating = hoverRating || calificacion;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">
          Escribe una reseña
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Cuéntale a otros clientes sobre tu experiencia.
        </p>
      </div>

      {/* Calificación */}
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Calificación
        </label>

        <div
          className="mt-2 flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const ratingValue = index + 1;

            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => setCalificacion(ratingValue)}
                onMouseEnter={() =>
                  setHoverRating(ratingValue)
                }
                disabled={isSubmitting}
                aria-label={`${ratingValue} ${
                  ratingValue === 1
                    ? "estrella"
                    : "estrellas"
                }`}
                className="rounded p-1 transition hover:scale-110 disabled:cursor-not-allowed"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    ratingValue <= displayedRating
                      ? "fill-orange-400 text-orange-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            );
          })}

          {calificacion > 0 && (
            <span className="ml-2 text-sm font-semibold text-slate-600">
              {calificacion}/5
            </span>
          )}
        </div>
      </div>

      {/* Comentario */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="review-comment"
            className="block text-sm font-semibold text-slate-700"
          >
            Comentario
          </label>

          <span className="text-xs text-slate-400">
            {comentario.length}/{MAX_REVIEW_LENGTH}
          </span>
        </div>

        <textarea
          id="review-comment"
          value={comentario}
          onChange={(event) => {
            setComentario(event.target.value);
            setError("");
          }}
          maxLength={MAX_REVIEW_LENGTH}
          disabled={isSubmitting}
          rows={4}
          placeholder="¿Qué te pareció el restaurante?"
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Acción */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            "Publicar reseña"
          )}
        </button>
      </div>
    </form>
  );
}