"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import type {
  MenuItem,
  MenuItemInput,
} from "@/services/restaurantService";

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSubmit: (data: MenuItemInput) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}

const EMPTY_FORM: MenuItemInput = {
  nombre: "",
  categoria: "",
  precio: 0,
  descripcion: "",
};

export function MenuItemForm({
  item,
  onSubmit,
  onCancel,
  saving = false,
}: MenuItemFormProps) {
  const [formData, setFormData] =
    useState<MenuItemInput>(EMPTY_FORM);

  const [error, setError] = useState("");

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setFormData({
        nombre: item.nombre,
        categoria: item.categoria,
        precio: item.precio,
        descripcion: item.descripcion,
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setError("");
  }, [item]);

  const handleChange = (
    field: keyof MenuItemInput,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombre = formData.nombre.trim();
    const categoria = formData.categoria.trim();
    const descripcion = formData.descripcion.trim();

    if (!nombre) {
      setError("El nombre del plato es obligatorio.");
      return;
    }

    if (!categoria) {
      setError("La categoría es obligatoria.");
      return;
    }

    if (!Number.isFinite(formData.precio) || formData.precio <= 0) {
      setError("El precio debe ser mayor que 0.");
      return;
    }

    setError("");

    await onSubmit({
      nombre,
      categoria,
      precio: formData.precio,
      descripcion,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-orange-200 bg-orange-50/50 p-5"
    >
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">
          {isEditing ? "Editar plato" : "Nuevo plato"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Actualiza la información de este plato."
            : "Añade un nuevo plato al menú de tu restaurante."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Nombre del plato
          </label>

          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              handleChange("nombre", e.target.value)
            }
            disabled={saving}
            placeholder="Ej. Pasta Carbonara"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Categoría
          </label>

          <input
            type="text"
            value={formData.categoria}
            onChange={(e) =>
              handleChange("categoria", e.target.value)
            }
            disabled={saving}
            placeholder="Ej. Entrantes"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Precio
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              $
            </span>

            <input
              type="number"
              min="1"
              step="1"
              value={formData.precio || ""}
              onChange={(e) =>
                handleChange(
                  "precio",
                  Number(e.target.value),
                )
              }
              disabled={saving}
              placeholder="10000"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-8 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Descripción
          </label>

          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              handleChange("descripcion", e.target.value)
            }
            disabled={saving}
            rows={3}
            placeholder="Describe el plato..."
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-5 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Agregar plato"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}