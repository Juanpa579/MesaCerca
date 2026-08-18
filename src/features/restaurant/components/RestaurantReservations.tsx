"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";

import type {
  Reservation,
  ReservationStatus,
} from "@/services/reservationService";

import {
  confirmReservation,
  getRestaurantReservations,
  rejectReservation,
} from "@/services/reservationService";

interface RestaurantReservationsProps {
  uid: string;
}

function getStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "confirmada":
      return "Confirmada";
    case "rechazada":
      return "Rechazada";
    case "cancelada":
      return "Cancelada";
  }
}

function getStatusClasses(status: ReservationStatus): string {
  switch (status) {
    case "pendiente":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";

    case "confirmada":
      return "bg-green-50 text-green-700 border-green-200";

    case "rechazada":
      return "bg-red-50 text-red-700 border-red-200";

    case "cancelada":
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  const parsedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return parsedDate.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReservationCard({
  reservation,
  onAction,
  isProcessing,
}: {
  reservation: Reservation;
  onAction: (
    reservationId: string,
    action: "confirm" | "reject",
  ) => void;
  isProcessing: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Información principal */}
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                {reservation.nombre}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  reservation.estado,
                )}`}
              >
                {getStatusLabel(reservation.estado)}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Reserva #{reservation.id}
            </p>
          </div>

          {/* Fecha y hora */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              <span>{formatDate(reservation.fecha)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{reservation.hora}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Users className="h-4 w-4 text-orange-500" />
              <span>
                {reservation.personas}{" "}
                {reservation.personas === 1
                  ? "persona"
                  : "personas"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>{reservation.telefono}</span>
            </div>
          </div>

          {/* Email */}
          <div className="text-sm">
            <span className="font-semibold text-slate-700">
              Email:
            </span>{" "}
            <span className="text-slate-600">
              {reservation.email}
            </span>
          </div>

          {/* Peticiones especiales */}
          {reservation.peticionesEspeciales && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Peticiones especiales
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {reservation.peticionesEspeciales}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        {reservation.estado === "pendiente" && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={() =>
                onAction(reservation.id, "confirm")
              }
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              Confirmar
            </button>

            <button
              type="button"
              onClick={() =>
                onAction(reservation.id, "reject")
              }
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Rechazar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function RestaurantReservations({
  uid,
}: RestaurantReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(
    null,
  );

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRestaurantReservations(uid);
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las reservas.",
      );
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleAction = async (
    reservationId: string,
    action: "confirm" | "reject",
  ) => {
    setError("");
    setProcessingId(reservationId);

    try {
      if (action === "confirm") {
        await confirmReservation(reservationId);
      } else {
        await rejectReservation(reservationId);
      }

      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la reserva.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Gestión de reservas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Consulta y gestiona las reservas de tu restaurante.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando reservas...</span>
          </div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />

          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No hay reservas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Las nuevas reservas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onAction={handleAction}
              isProcessing={processingId === reservation.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}