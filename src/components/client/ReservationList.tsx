"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

import type {
  Reservation,
  ReservationStatus,
} from "@/services/reservationService";

import {
  cancelReservation,
  getUserReservations,
} from "@/services/reservationService";

interface ReservationListProps {
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
      return "bg-yellow-100 text-yellow-700";

    case "confirmada":
      return "bg-green-100 text-green-700";

    case "rechazada":
      return "bg-red-100 text-red-700";

    case "cancelada":
      return "bg-slate-100 text-slate-600";
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

export function ReservationList({
  uid,
}: ReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const loadReservations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getUserReservations(uid);

        if (!cancelled) {
          setReservations(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las reservas.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const handleCancel = async (reservationId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres cancelar esta reserva?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setCancellingId(reservationId);

    try {
      await cancelReservation(reservationId);

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                estado: "cancelada",
              }
            : reservation,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar la reserva.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando tus reservas...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No tienes reservas
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Cuando hagas una reserva, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reservations.map((reservation) => {
            const isCancelling =
              cancellingId === reservation.id;

            const canCancel =
              reservation.estado !== "cancelada" &&
              reservation.estado !== "rechazada";

            return (
              <article
                key={reservation.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {reservation.restauranteNombre ||
                        "Restaurante"}
                    </h2>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        reservation.estado,
                      )}`}
                    >
                      {getStatusLabel(reservation.estado)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CalendarDays className="h-5 w-5 text-orange-500" />

                    <span>{formatDate(reservation.fecha)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock3 className="h-5 w-5 text-orange-500" />

                    <span>{reservation.hora}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users className="h-5 w-5 text-orange-500" />

                    <span>
                      {reservation.personas}{" "}
                      {reservation.personas === 1
                        ? "persona"
                        : "personas"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="h-5 w-5 text-orange-500" />

                    <span>{reservation.telefono}</span>
                  </div>
                </div>

                {reservation.peticionesEspeciales && (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Peticiones especiales
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {reservation.peticionesEspeciales}
                    </p>
                  </div>
                )}

                {canCancel && (
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCancel(reservation.id)
                      }
                      disabled={isCancelling}
                      className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Cancelar reserva
                        </>
                      )}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}