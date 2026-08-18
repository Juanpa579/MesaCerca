"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import type { RestaurantProfile } from "@/services/restaurantService";
import { createReservation } from "@/services/reservationService";
import { useAuth } from "@/context/AuthContext";

interface ReservationFormProps {
  restaurant: {
    uid: string;
    nombreRestaurante: string;
    horarioApertura: string;
    horarioCierre: string;
  };
  onCancel: () => void;
  onSuccess: (reservationId: string) => void;
}

interface FormErrors {
  fecha?: string;
  hora?: string;
  personas?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  peticionesEspeciales?: string;
}

function getToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMinutes(): number {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

function createTimeOptions(
  horarioApertura: string,
  horarioCierre: string,
): string[] {
  const [openingHour, openingMinute] = horarioApertura
    .split(":")
    .map(Number);

  const [closingHour, closingMinute] = horarioCierre
    .split(":")
    .map(Number);

  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;

  const lastReservationMinutes = closingMinutes - 30;

  if (lastReservationMinutes < openingMinutes) {
    return [];
  }

  const options: string[] = [];

  for (
    let totalMinutes = openingMinutes;
    totalMinutes <= lastReservationMinutes;
    totalMinutes += 30
  ) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    options.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}`,
    );
  }

  return options;
}

function validateFullName(name: string): string | undefined {
  const trimmed = name.trim();

  if (!trimmed) {
    return "El nombre completo es obligatorio.";
  }

  if (trimmed.length < 5) {
    return "El nombre completo debe tener al menos 5 caracteres.";
  }

  if (trimmed.length > 100) {
    return "El nombre completo no puede superar los 100 caracteres.";
  }

  if (!/\s+/.test(trimmed)) {
    return "Ingresa al menos un nombre y un apellido separados por un espacio.";
  }

  return undefined;
}

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return "El correo es obligatorio.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return "El correo no tiene un formato válido (ej: usuario@dominio.com).";
  }

  return undefined;
}

function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim();

  if (!trimmed) {
    return "El teléfono es obligatorio.";
  }

  if (!/^[\d +]+$/.test(trimmed)) {
    return "El teléfono debe contener entre 7 y 15 dígitos.";
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return "El teléfono debe contener entre 7 y 15 dígitos.";
  }

  return undefined;
}

export function ReservationForm({
  restaurant,
  onCancel,
  onSuccess,
}: ReservationFormProps) {
  const { user } = useAuth();

  const today = useMemo(() => getToday(), []);
  const [fecha, setFecha] = useState(today);
  const timeOptions = useMemo(() => {
  const options = createTimeOptions(
    restaurant.horarioApertura,
    restaurant.horarioCierre,
  );

  // Si la reserva es para hoy, ocultamos las horas que ya pasaron.
  if (fecha !== today) {
    return options;
  }

  const currentMinutes = getCurrentMinutes();

  return options.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const timeMinutes = hours * 60 + minutes;

    return timeMinutes > currentMinutes;
  });
}, [
  restaurant.horarioApertura,
  restaurant.horarioCierre,
  fecha,
  today,
]);
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("2");
  const [nombre, setNombre] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState(user?.phone ?? "");
  const [peticionesEspeciales, setPeticionesEspeciales] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fecha) {
      newErrors.fecha = "La fecha es obligatoria.";
    } else if (fecha < today) {
      newErrors.fecha = "No puedes seleccionar una fecha anterior a hoy.";
    }

    if (!hora) {
      newErrors.hora = "Selecciona una hora.";
    } else if (fecha === today) {
      const [hours, minutes] = hora.split(":").map(Number);

      const selectedMinutes = hours * 60 + minutes;
      const currentMinutes = getCurrentMinutes();

      if (selectedMinutes <= currentMinutes) {
        newErrors.hora = "La hora seleccionada ya pasó.";
      }
    }

    if (!personas) {
      newErrors.personas = "Selecciona el número de personas.";
    }

    const nombreError = validateFullName(nombre);
    if (nombreError) {
      newErrors.nombre = nombreError;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const phoneError = validatePhone(telefono);
    if (phoneError) {
      newErrors.telefono = phoneError;
    }

    if (peticionesEspeciales.length > 500) {
      newErrors.peticionesEspeciales =
        "Las peticiones especiales no pueden superar los 500 caracteres.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setServerError("");

    if (!user) {
      setServerError(
        "Debes iniciar sesión para realizar una reserva.",
      );
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationId = await createReservation({
        restauranteId: restaurant.uid,
        restauranteNombre: restaurant.nombreRestaurante,

        usuarioId: user.uid,

        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),

        fecha,
        hora,
        personas: Number(personas),

        peticionesEspeciales: peticionesEspeciales.trim(),
      });

      onSuccess(reservationId);
    } catch (error) {
      const firebaseCode = (
        error as {
          code?: string;
        }
      )?.code;

      if (firebaseCode === "permission-denied") {
        setServerError(
          "No tienes permiso para realizar esta reserva.",
        );
      } else if (firebaseCode === "unavailable") {
        setServerError(
          "El servicio no está disponible en este momento. Intenta nuevamente.",
        );
      } else {
        setServerError(
          error instanceof Error
            ? error.message
            : "No fue posible registrar la reserva. Intenta nuevamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Encabezado */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-orange-500 px-6 py-6 text-white shadow-sm">
        <p className="text-sm font-medium text-orange-100">
          Reserva en
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          {restaurant.nombreRestaurante || "Restaurante"}
        </h1>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        {/* Error del servidor */}
        {serverError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <p className="text-sm font-medium">
                {serverError}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Fecha / Hora */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="fecha"
                className="block text-sm font-semibold text-slate-900"
              >
                Fecha *
              </label>

              <input
                id="fecha"
                type="date"
                value={fecha}
                min={today}
                onChange={(event) => {
                  setFecha(event.target.value);

                  if (errors.fecha) {
                    setErrors((current) => ({
                      ...current,
                      fecha: undefined,
                    }));
                  }
                }}
                className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                  errors.fecha
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              />

              {errors.fecha && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fecha}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="hora"
                className="block text-sm font-semibold text-slate-900"
              >
                Hora *
              </label>

              <select
                id="hora"
                value={hora}
                onChange={(event) => {
                  setHora(event.target.value);

                  if (errors.hora) {
                    setErrors((current) => ({
                      ...current,
                      hora: undefined,
                    }));
                  }
                }}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                  errors.hora
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              >
                <option value="">Seleccionar hora</option>

                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {errors.hora && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.hora}
                </p>
              )}
            </div>
          </div>

          {/* Personas */}
          <div>
            <label
              htmlFor="personas"
              className="block text-sm font-semibold text-slate-900"
            >
              Número de personas *
            </label>

            <select
              id="personas"
              value={personas}
              onChange={(event) => {
                setPersonas(event.target.value);

                if (errors.personas) {
                  setErrors((current) => ({
                    ...current,
                    personas: undefined,
                  }));
                }
              }}
              className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                errors.personas
                  ? "border-red-400"
                  : "border-slate-300"
              }`}
            >
              {Array.from({ length: 20 }, (_, index) => {
                const value = index + 1;

                return (
                  <option key={value} value={value}>
                    {value} {value === 1 ? "persona" : "personas"}
                  </option>
                );
              })}
            </select>

            {errors.personas && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personas}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-semibold text-slate-900"
            >
              Nombre completo *
            </label>

            <input
              id="nombre"
              type="text"
              value={nombre}
              maxLength={100}
              onChange={(event) => {
                setNombre(event.target.value);

                if (errors.nombre) {
                  setErrors((current) => ({
                    ...current,
                    nombre: undefined,
                  }));
                }
              }}
              placeholder="Nombre y apellido"
              className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                errors.nombre
                  ? "border-red-400"
                  : "border-slate-300"
              }`}
            />

            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Email / Teléfono */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-900"
              >
                Email *
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (errors.email) {
                    setErrors((current) => ({
                      ...current,
                      email: undefined,
                    }));
                  }
                }}
                placeholder="usuario@dominio.com"
                className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                  errors.email
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-semibold text-slate-900"
              >
                Teléfono *
              </label>

              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(event) => {
                  setTelefono(event.target.value);

                  if (errors.telefono) {
                    setErrors((current) => ({
                      ...current,
                      telefono: undefined,
                    }));
                  }
                }}
                placeholder="+57 300 1234567"
                className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                  errors.telefono
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              />

              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Peticiones especiales */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="peticionesEspeciales"
                className="block text-sm font-semibold text-slate-900"
              >
                Peticiones especiales
              </label>

              <span className="text-xs text-slate-400">
                {peticionesEspeciales.length}/500
              </span>
            </div>

            <textarea
              id="peticionesEspeciales"
              value={peticionesEspeciales}
              maxLength={500}
              onChange={(event) => {
                setPeticionesEspeciales(event.target.value);

                if (errors.peticionesEspeciales) {
                  setErrors((current) => ({
                    ...current,
                    peticionesEspeciales: undefined,
                  }));
                }
              }}
              placeholder="Alergias, preferencias de asiento, celebraciones..."
              rows={4}
              className={`mt-2 w-full resize-none rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-500 ${
                errors.peticionesEspeciales
                  ? "border-red-400"
                  : "border-slate-300"
              }`}
            />

            {errors.peticionesEspeciales && (
              <p className="mt-1 text-sm text-red-600">
                {errors.peticionesEspeciales}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}

            {isSubmitting
              ? "Procesando..."
              : "Confirmar Reserva"}
          </button>
        </div>
      </form>
    </div>
  );
}