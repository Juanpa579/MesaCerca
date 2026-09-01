// Servicio de restaurantes: maneja Firestore (colección "restaurantes").
//
// Los archivos (imagen de portada, documentos legales) se almacenan como base64
// directamente en Firestore — sin usar Firebase Storage.
//
// Límite importante: Firestore admite hasta 1 MB por documento.
// Por eso la imagen de portada se limita a 500 KB y los docs legales a 700 KB.

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import type { Timestamp, Unsubscribe } from "firebase/firestore";

import { db } from "@/config/firebase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RestaurantProfile {
  uid: string;
  nombreRestaurante: string;
  tipoCocina: string;
  direccion: string;
  telefono: string;
  descripcion: string;
  horarioApertura: string;
  horarioCierre: string;
  rangoPrecios: string;

  /** Latitud de la ubicación del restaurante. */
  latitud: number | null;

  /** Longitud de la ubicación del restaurante. */
  longitud: number | null;

  /** Data URL (base64) de la imagen de portada, o string vacío si no hay. */
  imagenPortada: string;

  createdAt: Timestamp | null;
}

export interface RestaurantProfileInput {
  nombreRestaurante: string;
  tipoCocina: string;
  direccion: string;
  telefono: string;
  descripcion: string;
  horarioApertura: string;
  horarioCierre: string;
  rangoPrecios: string;

  /** Latitud seleccionada en el mapa. */
  latitud: number | null;

  /** Longitud seleccionada en el mapa. */
  longitud: number | null;
}

export interface LegalDocument {
  nombre: string;
  tipo: string;
  base64: string;
}

export interface MenuItem {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
}

export interface MenuItemInput {
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RESTAURANTS_COL = "restaurantes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte un File a Data URL (base64). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);

    reader.onerror = () =>
      reject(new Error("No se pudo leer el archivo."));

    reader.readAsDataURL(file);
  });
}

// ─── Restaurante (perfil) ─────────────────────────────────────────────────────

/** Crea el documento base del restaurante al registrarse. */
export async function createRestaurantProfile(
  uid: string,
): Promise<void> {
  const r = doc(db, RESTAURANTS_COL, uid);

  const snap = await getDoc(r);

  if (snap.exists()) return;

  await setDoc(r, {
    uid,

    nombreRestaurante: "",
    tipoCocina: "",
    direccion: "",
    telefono: "",
    descripcion: "",

    horarioApertura: "12:00",
    horarioCierre: "22:00",

    rangoPrecios: "$$",

    latitud: null,
    longitud: null,

    imagenPortada: "",

    createdAt: serverTimestamp(),
  });
}

/**
 * Obtiene el perfil de un restaurante.
 *
 * Este servicio solamente obtiene la información propia
 * del restaurante. Las reseñas y su calificación se manejan
 * desde reviewService.
 */
export async function getRestaurantProfile(
  uid: string,
): Promise<RestaurantProfile | null> {
  const r = doc(db, RESTAURANTS_COL, uid);

  const snap = await getDoc(r);

  if (!snap.exists()) return null;

  return {
    ...(snap.data() as Omit<RestaurantProfile, "uid">),
    uid: snap.id,
  };
}

/**
 * Obtiene todos los restaurantes registrados.
 *
 * Este servicio no consulta las reseñas.
 * Las estadísticas de reseñas se calculan posteriormente
 * desde el cliente utilizando reviewService.
 */
export async function getRestaurants(): Promise<RestaurantProfile[]> {
  const snapshot = await getDocs(
    collection(db, RESTAURANTS_COL),
  );

  return snapshot.docs.map((document) => ({
    ...(document.data() as Omit<RestaurantProfile, "uid">),
    uid: document.id,
  }));
}

export function getCuisineCategories(
  restaurants: RestaurantProfile[],
): string[] {
  return Array.from(
    new Set(
      restaurants
        .map((restaurant) => restaurant.tipoCocina.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Actualiza la información editable del restaurante.
 *
 * Las reseñas y sus estadísticas no se modifican aquí.
 */
export async function updateRestaurantProfile(
  uid: string,
  data: RestaurantProfileInput,
): Promise<void> {
  const r = doc(db, RESTAURANTS_COL, uid);

  await updateDoc(r, {
    nombreRestaurante: data.nombreRestaurante,
    tipoCocina: data.tipoCocina,
    direccion: data.direccion,
    telefono: data.telefono,
    descripcion: data.descripcion,
    horarioApertura: data.horarioApertura,
    horarioCierre: data.horarioCierre,
    rangoPrecios: data.rangoPrecios,

    latitud: data.latitud,
    longitud: data.longitud,
  });
}

// ─── Imagen de portada (base64 en Firestore) ──────────────────────────────────

/**
 * Convierte la imagen a base64 y la guarda en el campo imagenPortada
 * de Firestore.
 *
 * Límite: 500 KB para no superar el 1 MB del documento de Firestore.
 */
export async function saveCoverImage(
  uid: string,
  file: File,
): Promise<string> {
  const base64 = await fileToBase64(file);

  const r = doc(db, RESTAURANTS_COL, uid);

  await updateDoc(r, {
    imagenPortada: base64,
  });

  return base64;
}

// ─── Documentos legales (base64 en Firestore del usuario) ─────────────────────

/**
 * Convierte un archivo legal a base64 y devuelve el objeto LegalDocument.
 *
 * El guardado real ocurre en AuthContext junto con createUserProfile.
 */
export async function convertLegalDocument(
  file: File,
): Promise<LegalDocument> {
  const base64 = await fileToBase64(file);

  return {
    nombre: file.name,
    tipo: file.type,
    base64,
  };
}

// ─── Menú ─────────────────────────────────────────────────────────────────────

function menuCol(uid: string) {
  return collection(
    db,
    RESTAURANTS_COL,
    uid,
    "menu",
  );
}

function menuDocRef(
  uid: string,
  dishId: string,
) {
  return doc(
    db,
    RESTAURANTS_COL,
    uid,
    "menu",
    dishId,
  );
}

/** Añade un plato al menú. Devuelve el ID generado. */
export async function addDish(
  uid: string,
  data: MenuItemInput,
): Promise<string> {
  const docRef = await addDoc(
    menuCol(uid),
    {
      nombre: data.nombre,
      categoria: data.categoria,
      precio: data.precio,
      descripcion: data.descripcion,
    },
  );

  return docRef.id;
}

/** Actualiza un plato existente. */
export async function updateDish(
  uid: string,
  dishId: string,
  data: MenuItemInput,
): Promise<void> {
  await updateDoc(
    menuDocRef(uid, dishId),
    {
      nombre: data.nombre,
      categoria: data.categoria,
      precio: data.precio,
      descripcion: data.descripcion,
    },
  );
}

/** Elimina un plato. */
export async function deleteDish(
  uid: string,
  dishId: string,
): Promise<void> {
  await deleteDoc(
    menuDocRef(uid, dishId),
  );
}

/** Suscripción en tiempo real al menú del restaurante. */
export function subscribeToMenu(
  uid: string,
  callback: (items: MenuItem[]) => void,
): Unsubscribe {
  return onSnapshot(
    menuCol(uid),
    (snapshot) => {
      const items: MenuItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MenuItem, "id">),
      }));

      callback(items);
    },
  );
}

/**
 * Obtiene todos los platos del menú del restaurante.
 */
export async function getMenu(
  uid: string,
): Promise<MenuItem[]> {
  const snapshot = await getDocs(
    menuCol(uid),
  );

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<MenuItem, "id">),
  }));
}