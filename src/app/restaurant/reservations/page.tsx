"use client";

import { useAuth } from "@/context/AuthContext";
import { RestaurantReservations } from "@/features/restaurant/components/RestaurantReservations";

export default function RestaurantReservationsPage() {
  const { user } = useAuth();

  if (!user || user.rol !== "restaurante") {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <RestaurantReservations uid={user.uid} />
      </div>
    </main>
  );
}