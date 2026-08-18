"use client";

import { CalendarDays } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ReservationList } from "@/components/client/ReservationList";

export default function ReservationsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Mis reservas
            </h1>

            <p className="mt-2 text-slate-500">
              Debes iniciar sesión para consultar tus reservas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-orange-500" />

            <h1 className="text-3xl font-bold text-slate-900">
              Mis reservas
            </h1>
          </div>

          <p className="mt-2 text-slate-600">
            Consulta y gestiona tus reservas.
          </p>
        </div>

        <ReservationList uid={user.uid} />
      </div>
    </main>
  );
}