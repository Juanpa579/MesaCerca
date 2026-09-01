"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { getRestaurantReviews } from "@/services/reviewService";

interface RestaurantRatingProps {
  restauranteId: string;
  className?: string;
}

export function RestaurantRating({
  restauranteId,
  className = "",
}: RestaurantRatingProps) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadRating() {
      try {
        const reviews = await getRestaurantReviews(
          restauranteId,
        );

        const reviewCount = reviews.length;

        if (reviewCount === 0) {
          setCount(0);
          setAverage(0);
          return;
        }

        const total = reviews.reduce(
          (sum, review) => sum + Number(review.calificacion),
          0,
        );

        const calculatedAverage = total / reviewCount;

        setCount(reviewCount);
        setAverage(
          Number(calculatedAverage.toFixed(1)),
        );
      } catch (error) {
        console.error(
          "Error al cargar la calificación del restaurante:",
          error,
        );

        setCount(0);
        setAverage(0);
      }
    }

    if (restauranteId) {
      loadRating();
    }
  }, [restauranteId]);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= Math.round(average)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      <span className="text-sm font-medium text-gray-700">
        {average > 0
          ? average.toFixed(1)
          : "Sin calificación"}
      </span>

      <span className="text-sm text-gray-500">
        ({count})
      </span>
    </div>
  );
}