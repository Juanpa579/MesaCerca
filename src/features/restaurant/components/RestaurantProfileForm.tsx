"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import type {
  RestaurantProfile,
  RestaurantProfileInput,
} from "../../../services/restaurantService";

import {
  updateRestaurantProfile,
  saveCoverImage,
} from "../../../services/restaurantService";

interface RestaurantProfileFormProps {
  uid: string;
  profile: RestaurantProfile;
  onProfileUpdated: (profile: RestaurantProfile) => void;
}

const MAX_IMAGE_SIZE = 500 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function RestaurantProfileForm({
  uid,
  profile,
  onProfileUpdated,
}: RestaurantProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RestaurantProfileInput>({
    nombreRestaurante: profile.nombreRestaurante,
    tipoCocina: profile.tipoCocina,
    direccion: profile.direccion,
    telefono: profile.telefono,
    descripcion: profile.descripcion,
    horarioApertura: profile.horarioApertura,
    horarioCierre: profile.horarioCierre,
    rangoPrecios: profile.rangoPrecios,
  });

  const [imagePreview, setImagePreview] = useState(profile.imagenPortada);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setFormData({
      nombreRestaurante: profile.nombreRestaurante,
      tipoCocina: profile.tipoCocina,
      direccion: profile.direccion,
      telefono: profile.telefono,
      descripcion: profile.descripcion,
      horarioApertura: profile.horarioApertura,
      horarioCierre: profile.horarioCierre,
      rangoPrecios: profile.rangoPrecios,
    });

    setImagePreview(profile.imagenPortada);
  }, [profile]);

  const handleChange = (
    field: keyof RestaurantProfileInput,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");

    setIsSaving(true);

    try {
      await updateRestaurantProfile(uid, formData);

      onProfileUpdated({
        ...profile,
        ...formData,
      });

      setSuccess("Información del restaurante actualizada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el restaurante.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    // Permite volver a seleccionar el mismo archivo
    event.target.value = "";

    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("La imagen debe ser JPG, PNG o WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("La imagen no puede superar los 500 KB.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const base64 = await saveCoverImage(uid, file);

      setImagePreview(base64);

      onProfileUpdated({
        ...profile,
        imagenPortada: base64,
      });

      setSuccess("Imagen de portada actualizada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la imagen.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portada */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-56 bg-slate-100">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Imagen de portada del restaurante"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-slate-400">
                <Camera className="mx-auto mb-2 h-10 w-10" />
                <p className="text-sm">
                  No hay imagen de portada
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage || isSaving}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Cambiar portada
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-slate-500">
            JPG, PNG o WEBP · máximo 500 KB
          </p>
        </div>
      </section>

      {/* Mensajes */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Información */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Información del restaurante
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Administra la información que verán tus clientes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre del restaurante
            </label>

            <input
              type="text"
              value={formData.nombreRestaurante}
              onChange={(e) =>
                handleChange("nombreRestaurante", e.target.value)
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
              placeholder="Ej. Restaurante La Esquina"
            />
          </div>

          {/* Tipo de cocina */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipo de cocina
            </label>

            <input
              type="text"
              value={formData.tipoCocina}
              onChange={(e) =>
                handleChange("tipoCocina", e.target.value)
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
              placeholder="Ej. Italiana"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Dirección
            </label>

            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                handleChange("direccion", e.target.value)
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
              placeholder="Ej. Calle 10 #20-30"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Teléfono
            </label>

            <input
              type="text"
              value={formData.telefono}
              onChange={(e) =>
                handleChange("telefono", e.target.value)
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
              placeholder="Ej. 6041234567"
            />
          </div>

          {/* Horario */}
            <div className="md:col-span-2">

            <div className="grid gap-5 sm:grid-cols-2">
                {/* Hora de apertura */}
                <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                    Hora de apertura
                </label>

                <select
                    value={formData.horarioApertura}
                    onChange={(e) =>
                    handleChange("horarioApertura", e.target.value)
                    }
                    disabled={isSaving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
                >
                    {Array.from({ length: 48 }, (_, index) => {
                    const totalMinutes = index * 30;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    const time = `${String(hours).padStart(2, "0")}:${String(
                        minutes,
                    ).padStart(2, "0")}`;

                    return (
                        <option key={time} value={time}>
                        {time}
                        </option>
                    );
                    })}
                </select>
                </div>

                {/* Hora de cierre */}
                <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                    Hora de cierre
                </label>

                <select
                    value={formData.horarioCierre}
                    onChange={(e) =>
                    handleChange("horarioCierre", e.target.value)
                    }
                    disabled={isSaving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
                >
                    {Array.from({ length: 48 }, (_, index) => {
                    const totalMinutes = index * 30;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    const time = `${String(hours).padStart(2, "0")}:${String(
                        minutes,
                    ).padStart(2, "0")}`;

                    return (
                        <option key={time} value={time}>
                        {time}
                        </option>
                    );
                    })}
                </select>
                </div>
            </div>
            </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>

            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                handleChange("descripcion", e.target.value)
              }
              disabled={isSaving}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
              placeholder="Describe tu restaurante..."
            />
          </div>
        </div>

        {/* Guardar */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving || isUploadingImage}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}