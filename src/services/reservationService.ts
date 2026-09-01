// Servicio de reservas: maneja la colección "reservas" de Firestore.
//
// Estados posibles:
// - pendiente
// - confirmada
// - rechazada
// - cancelada

import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

import { db } from "@/config/firebase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ReservationStatus =
  | "pendiente"
  | "confirmada"
  | "rechazada"
  | "cancelada";

export interface Reservation {
  id: string;

  restauranteId: string;
  restauranteNombre: string;

  usuarioId: string;

  nombre: string;
  email: string;
  telefono: string;

  fecha: string;
  hora: string;
  personas: number;

  peticionesEspeciales: string;

  estado: ReservationStatus;

  creadoEn: Timestamp | null;
}

export interface ReservationInput {
  restauranteId: string;
  restauranteNombre: string;

  usuarioId: string;

  nombre: string;
  email: string;
  telefono: string;

  fecha: string;
  hora: string;
  personas: number;

  peticionesEspeciales: string;
}

// ─── Colección ────────────────────────────────────────────────────────────────

const RESERVATIONS_COL = "reservas";

// ─── Crear reserva ────────────────────────────────────────────────────────────

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

/**
 * Crea una nueva reserva.
 *
 * La reserva siempre comienza con estado "pendiente".
 */

export async function createReservation(
  data: ReservationInput,
): Promise<string> {
  const today = getToday();

  // Una reserva no puede hacerse para una fecha anterior a hoy.
  if (data.fecha < today) {
    throw new Error(
      "No puedes realizar una reserva para una fecha anterior a hoy.",
    );
  }

  // Si la reserva es para hoy, la hora debe ser futura.
  if (data.fecha === today) {
    const [hours, minutes] = data.hora.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error("La hora de la reserva no es válida.");
    }

    const selectedMinutes = hours * 60 + minutes;
    const currentMinutes = getCurrentMinutes();

    if (selectedMinutes <= currentMinutes) {
      throw new Error(
        "No puedes realizar una reserva para una hora que ya pasó.",
      );
    }
  }

  const reservationRef = await addDoc(
    collection(db, RESERVATIONS_COL),
    {
      restauranteId: data.restauranteId,
      restauranteNombre: data.restauranteNombre,

      usuarioId: data.usuarioId,

      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,

      fecha: data.fecha,
      hora: data.hora,
      personas: data.personas,

      peticionesEspeciales: data.peticionesEspeciales,

      estado: "pendiente",

      creadoEn: serverTimestamp(),
    },
  );

  return reservationRef.id;
}

// ─── Reservas del usuario ─────────────────────────────────────────────────────

/**
 * Obtiene todas las reservas del usuario autenticado,
 * ordenadas de más reciente a más antigua.
 */
export async function getUserReservations(
  uid: string,
): Promise<Reservation[]> {
  const reservationsQuery = query(
    collection(db, RESERVATIONS_COL),
    where("usuarioId", "==", uid),
    orderBy("creadoEn", "desc"),
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...(reservationDoc.data() as Omit<Reservation, "id">),
  }));
}

// ─── Cancelar reserva ─────────────────────────────────────────────────────────

/**
 * Cancela una reserva.
 *
 * Las reglas de Firestore serán las encargadas de garantizar
 * que solamente el usuario propietario pueda realizar esta operación.
 */
export async function cancelReservation(
  reservationId: string,
): Promise<void> {
  const reservationRef = doc(
    db,
    RESERVATIONS_COL,
    reservationId,
  );

  await updateDoc(reservationRef, {
    estado: "cancelada",
  });
}

// ─── Reservas del restaurante ────────────────────────────────────────────────

/**
 * Obtiene todas las reservas de un restaurante,
 * ordenadas de más reciente a más antigua.
 */
export async function getRestaurantReservations(
  restauranteId: string,
): Promise<Reservation[]> {
  const reservationsQuery = query(
    collection(db, RESERVATIONS_COL),
    where("restauranteId", "==", restauranteId),
    orderBy("creadoEn", "desc"),
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...(reservationDoc.data() as Omit<Reservation, "id">),
  }));
}

// ─── Gestión de reservas por restaurante ─────────────────────────────────────

/**
 * Confirma una reserva pendiente.
 */
export async function confirmReservation(
  reservationId: string,
): Promise<void> {
  const reservationRef = doc(
    db,
    RESERVATIONS_COL,
    reservationId,
  );

  await updateDoc(reservationRef, {
    estado: "confirmada",
  });
}

/**
 * Rechaza una reserva pendiente.
 */
export async function rejectReservation(
  reservationId: string,
): Promise<void> {
  const reservationRef = doc(
    db,
    RESERVATIONS_COL,
    reservationId,
  );

  await updateDoc(reservationRef, {
    estado: "rechazada",
  });
}