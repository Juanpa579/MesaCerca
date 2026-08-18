"use client";

import { useRouter } from "next/navigation";

import { ReservationForm } from "./ReservationForm";

interface ReservationPageClientProps {
  restaurant: {
    uid: string;
    nombreRestaurante: string;
    horarioApertura: string;
    horarioCierre: string;
  };
}

export function ReservationPageClient({
  restaurant,
}: ReservationPageClientProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  const handleSuccess = () => {
    // Por ahora regresamos al detalle del restaurante.
    // Luego podemos reemplazar esto por la pantalla
    // de "¡Reserva Confirmada!" que pide Jira.
    router.push(`/restaurant/${restaurant.uid}`);
  };

  return (
    <ReservationForm
      restaurant={restaurant}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}