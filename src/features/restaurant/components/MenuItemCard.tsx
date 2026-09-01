"use client";

import { Pencil, Trash2, Utensils } from "lucide-react";
import type { MenuItem } from "@/services/restaurantService";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  disabled?: boolean;
}

export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  disabled = false,
}: MenuItemCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Información */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
              <Utensils className="h-4 w-4 text-orange-500" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900">
                {item.nombre}
              </h3>

              {item.categoria && (
                <p className="text-xs text-orange-600">
                  {item.categoria}
                </p>
              )}
            </div>
          </div>

          {item.descripcion && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {item.descripcion}
            </p>
          )}

          <p className="mt-4 text-lg font-bold text-slate-900">
            ${item.precio.toLocaleString("es-CO")}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={disabled}
            title="Editar plato"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={disabled}
            title="Eliminar plato"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}