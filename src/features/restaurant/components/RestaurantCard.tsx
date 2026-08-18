"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  UtensilsCrossed,
  CalendarPlus,
} from "lucide-react";

import type { RestaurantProfile } from "@/services/restaurantService";

interface RestaurantCardProps {
  restaurant: RestaurantProfile;
}

export function RestaurantCard({
  restaurant,
}: RestaurantCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* Enlace al detalle del restaurante */}
      <Link
        href={`/restaurant/${restaurant.uid}`}
        className="block"
      >
        {/* Imagen */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          {restaurant.imagenPortada ? (
            <img
              src={restaurant.imagenPortada}
              alt={`Imagen de ${restaurant.nombreRestaurante}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UtensilsCrossed className="h-12 w-12 text-slate-300" />
            </div>
          )}

          {/* Rango de precios */}
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            {restaurant.rangoPrecios || "$$"}
          </span>
        </div>

        {/* Información */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-orange-600">
            {restaurant.nombreRestaurante || "Restaurante sin nombre"}
          </h3>

          {restaurant.tipoCocina && (
            <p className="mt-1 text-sm font-medium text-orange-600">
              {restaurant.tipoCocina}
            </p>
          )}

          {restaurant.descripcion && (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {restaurant.descripcion}
            </p>
          )}

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {restaurant.direccion && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="line-clamp-1">
                  {restaurant.direccion}
                </span>
              </div>
            )}

            {restaurant.horarioApertura && restaurant.horarioCierre && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{restaurant.horarioApertura} - {restaurant.horarioCierre}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Botón de reserva */}
      <div className="border-t border-slate-100 px-5 pb-5">
        <Link
          href={`/restaurant/${restaurant.uid}/reserve`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <CalendarPlus className="h-4 w-4" />
          Reservar
        </Link>
      </div>
    </div>
  );
}