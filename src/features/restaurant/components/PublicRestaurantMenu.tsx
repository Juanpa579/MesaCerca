import { UtensilsCrossed } from "lucide-react";

import { getMenu } from "@/services/restaurantService";

interface PublicRestaurantMenuProps {
  uid: string;
}

export async function PublicRestaurantMenu({
  uid,
}: PublicRestaurantMenuProps) {
  const menu = await getMenu(uid);

  if (menu.length === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UtensilsCrossed className="mx-auto h-10 w-10 text-slate-300" />

        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Menú
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Este restaurante todavía no tiene platos disponibles.
        </p>
      </section>
    );
  }

  const categories = Array.from(
    new Set(menu.map((item) => item.categoria || "Otros")),
  );

  return (
    <section className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Menú
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Conoce los platos disponibles.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const items = menu.filter(
            (item) => (item.categoria || "Otros") === category,
          );

          return (
            <div key={category}>
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                {category}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-slate-900">
                        {item.nombre}
                      </h4>

                      <span className="shrink-0 font-bold text-orange-600">
                        ${item.precio.toLocaleString("es-CO")}
                      </span>
                    </div>

                    {item.descripcion && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.descripcion}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}