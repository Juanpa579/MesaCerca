import { notFound } from "next/navigation";

import { getRestaurantProfile } from "@/services/restaurantService";
import { ReservationPageClient } from "@/features/reservation/components/ReservationPageClient";

interface ReservationPageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function ReservationPage({
  params,
}: ReservationPageProps) {
  const { uid } = await params;

  const restaurant = await getRestaurantProfile(uid);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <ReservationPageClient
        restaurant={{
            uid: restaurant.uid,
            nombreRestaurante: restaurant.nombreRestaurante,
            horarioApertura: restaurant.horarioApertura,
            horarioCierre: restaurant.horarioCierre,
        }}
        />
      </div>
    </main>
  );
}