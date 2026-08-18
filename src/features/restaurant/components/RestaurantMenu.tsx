"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  UtensilsCrossed,
} from "lucide-react";

import {
  addDish,
  deleteDish,
  subscribeToMenu,
  updateDish,
  type MenuItem,
  type MenuItemInput,
} from "@/services/restaurantService";

import { MenuItemCard } from "./MenuItemCard";
import { MenuItemForm } from "./MenuItemForm";

interface RestaurantMenuProps {
  uid: string;
}

export function RestaurantMenu({
  uid,
}: RestaurantMenuProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Suscripción en tiempo real al menú.
   *
   * Cada vez que Firestore cambie:
   *
   * restaurantes/{uid}/menu
   *
   * recibimos automáticamente la nueva lista.
   */
  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToMenu(uid, (menuItems) => {
      setItems(menuItems);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  /*
   * Abre el formulario para crear un plato.
   */
  const handleNewItem = () => {
    setEditingItem(null);
    setShowForm(true);
    setError("");
  };

  /*
   * Abre el formulario para editar un plato.
   */
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
    setError("");
  };

  /*
   * Cierra el formulario.
   */
  const handleCancel = () => {
    if (saving) return;

    setShowForm(false);
    setEditingItem(null);
  };

  /*
   * Crear o actualizar plato.
   */
  const handleSubmit = async (
    data: MenuItemInput,
  ) => {
    setSaving(true);
    setError("");

    try {
      if (editingItem) {
        await updateDish(
          uid,
          editingItem.id,
          data,
        );
      } else {
        await addDish(uid, data);
      }

      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el plato.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Eliminar plato.
   */
  const handleDelete = async (item: MenuItem) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${item.nombre}"?`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteDish(uid, item.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el plato.",
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <UtensilsCrossed className="h-5 w-5 text-orange-500" />
            Menú
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona los platos que ofrece tu restaurante.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleNewItem}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Agregar plato
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-6">
          <MenuItemForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />

          <p className="mt-3 text-sm text-slate-500">
            Cargando menú...
          </p>
        </div>
      ) : items.length === 0 ? (
        /* Menú vacío */
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Tu menú está vacío
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Agrega los platos que ofrece tu restaurante
            para que los clientes puedan conocerlos.
          </p>

          {!showForm && (
            <button
              type="button"
              onClick={handleNewItem}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Agregar primer plato
            </button>
          )}
        </div>
      ) : (
        /* Lista de platos */
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              disabled={saving}
            />
          ))}
        </div>
      )}
    </div>
  );
}