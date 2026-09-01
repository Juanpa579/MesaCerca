"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { RestaurantProfile } from "@/services/restaurantService";

interface RestaurantMapCardProps {
  restaurant: RestaurantProfile;
  rating?: number;
  reviewCount?: number;
}

export function RestaurantMapCard({
  restaurant,
  rating,
  reviewCount = 0,
}: RestaurantMapCardProps) {
  return (
    <div className="w-[260px] overflow-hidden rounded-xl bg-white">
      {/* Imagen */}
      {restaurant.imagenPortada ? (
        <img
          src={restaurant.imagenPortada}
          alt={restaurant.nombreRestaurante}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-slate-100">
          <MapPin className="h-8 w-8 text-slate-300" />
        </div>
      )}

      {/* Información */}
      <div className="p-3">
        <h3 className="truncate text-base font-bold text-slate-900">
          {restaurant.nombreRestaurante || "Restaurante"}
        </h3>

        {restaurant.tipoCocina && (
          <p className="mt-1 text-xs text-slate-500">
            {restaurant.tipoCocina}
          </p>
        )}

        {restaurant.direccion && (
          <div className="mt-2 flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />

            <p className="text-xs text-slate-500">
              {restaurant.direccion}
            </p>
          </div>
        )}

        {/* Calificación */}
        {rating !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />

            <span className="text-sm font-semibold text-slate-700">
              {rating.toFixed(1)}
            </span>

            <span className="text-xs text-slate-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Ver restaurante */}
        <Link
          href={`/restaurant/${restaurant.uid}`}
          className="mt-3 block w-full rounded-lg bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-orange-600"
        >
          Ver restaurante
        </Link>
      </div>
    </div>
  );
}