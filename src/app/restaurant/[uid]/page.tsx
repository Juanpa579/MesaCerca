import Link from "next/link";
import { CalendarPlus, Clock, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { getRestaurantProfile } from "@/services/restaurantService";
import { PublicRestaurantMenu } from "@/features/restaurant/components/PublicRestaurantMenu";

interface RestaurantPageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function RestaurantPage({
  params,
}: RestaurantPageProps) {
  const { uid } = await params;

  const restaurant = await getRestaurantProfile(uid);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-200px)] bg-slate-50">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="relative h-[280px] w-full overflow-hidden md:h-[340px]">
        {/* Imagen */}
        {restaurant.imagenPortada ? (
          <img
            src={restaurant.imagenPortada}
            alt={`Portada de ${restaurant.nombreRestaurante}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-orange-100" />
        )}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-slate-950/60" />

        {/* Información sobre la imagen */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-6 pb-10 md:px-8 md:pb-12">
          <div className="max-w-4xl text-white">
            {/* Categoría + precio */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {restaurant.tipoCocina && (
                <span className="text-lg font-semibold">
                  {restaurant.tipoCocina}
                </span>
              )}

              {restaurant.rangoPrecios && (
                <span className="text-lg font-semibold">
                  {restaurant.rangoPrecios}
                </span>
              )}
            </div>

            {/* Nombre */}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {restaurant.nombreRestaurante || "Restaurante"}
            </h1>

            {/* Descripción */}
            {restaurant.descripcion && (
              <p className="mt-3 max-w-4xl text-lg leading-relaxed text-white/90 md:text-xl">
                {restaurant.descripcion}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}
      <section className="px-4 py-10 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              MENÚ
              ================================================= */}
          <div className="min-w-0">
            <h2 className="text-3xl font-bold text-slate-900">
              Menú
            </h2>

            <div className="mt-6">
              <PublicRestaurantMenu uid={restaurant.uid} />
            </div>
          </div>

          {/* =================================================
              INFORMACIÓN
              ================================================= */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-7 shadow-md">
              <h2 className="text-3xl font-bold text-slate-900">
                Información
              </h2>

              <div className="mt-8 space-y-7">
                {/* Dirección */}
                {restaurant.direccion && (
                  <div className="flex gap-4">
                    <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Dirección
                      </p>

                      <p className="mt-1 text-base leading-relaxed text-slate-600">
                        {restaurant.direccion}
                      </p>
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                {restaurant.telefono && (
                  <div className="flex gap-4">
                    <Phone className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Teléfono
                      </p>

                      <p className="mt-1 text-base text-slate-600">
                        {restaurant.telefono}
                      </p>
                    </div>
                  </div>
                )}

                {/* Horario */}
                {restaurant.horarioApertura &&
                  restaurant.horarioCierre && (
                    <div className="flex gap-4">
                      <Clock className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />

                      <div>
                        <p className="font-bold text-slate-900">
                          Horario
                        </p>

                        <p className="mt-1 text-base text-slate-600">
                          {restaurant.horarioApertura} -{" "}
                          {restaurant.horarioCierre}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Reserva */}
              <Link
                href={`/restaurant/${restaurant.uid}/reserve`}
                className="mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-5 py-4 text-lg font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <CalendarPlus className="h-6 w-6" />
                Hacer Reserva
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}