// Servicio de reseñas: maneja Firestore para las reseñas de los restaurantes.
//
// Las reseñas se almacenan como subcolección:
//
// restaurantes/{restauranteId}/resena/{reviewId}
//
// Cada reseña pertenece a un usuario y a un restaurante.
//
// Las reseñas:
// - Tienen un límite de 500 caracteres.
// - No pueden editarse.
// - Pueden eliminarse por el usuario que las creó.
// - Tienen una calificación entre 1 y 5.
//
// La cantidad de reseñas y la calificación promedio
// NO se almacenan ni actualizan en Firestore.
//
// Estas estadísticas se calculan en el cliente mediante
// el componente RestaurantRating.tsx.

import {
collection,
deleteDoc,
doc,
getDocs,
orderBy,
query,
serverTimestamp,
addDoc,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

import { db } from "@/config/firebase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Review {
id: string;

restauranteId: string;

usuarioId: string;
usuarioNombre: string;

calificacion: number;
comentario: string;

creadoEn: Timestamp | null;
}

export interface ReviewInput {
restauranteId: string;

usuarioId: string;
usuarioNombre: string;

calificacion: number;
comentario: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RESTAURANTS_COL = "restaurantes";
const REVIEWS_COL = "resena";

export const MAX_REVIEW_LENGTH = 500;

// ─── Referencias ──────────────────────────────────────────────────────────────

function reviewsCol(restauranteId: string) {
return collection(
db,
RESTAURANTS_COL,
restauranteId,
REVIEWS_COL,
);
}

function reviewDocRef(
restauranteId: string,
reviewId: string,
) {
return doc(
db,
RESTAURANTS_COL,
restauranteId,
REVIEWS_COL,
reviewId,
);
}

// ─── Crear reseña ─────────────────────────────────────────────────────────────

/**

* Crea una nueva reseña.
*
* Las estadísticas del restaurante NO se actualizan aquí.
* La cantidad y el promedio se calculan en el cliente
* cuando se muestran las reseñas.
  */
  export async function createReview(
  data: ReviewInput,
  ): Promise<string> {
  const comentario = data.comentario.trim();

if (!comentario) {
throw new Error(
"El comentario de la reseña es obligatorio.",
);
}

if (comentario.length > MAX_REVIEW_LENGTH) {
throw new Error(
`La reseña no puede superar los ${MAX_REVIEW_LENGTH} caracteres.`,
);
}

if (
!Number.isInteger(data.calificacion) ||
data.calificacion < 1 ||
data.calificacion > 5
) {
throw new Error(
"La calificación debe estar entre 1 y 5.",
);
}

if (!data.usuarioId) {
throw new Error(
"El usuario debe estar autenticado para crear una reseña.",
);
}

if (!data.restauranteId) {
throw new Error(
"El restaurante es obligatorio.",
);
}

const reviewRef = await addDoc(
  reviewsCol(data.restauranteId),
  {
    restauranteId: data.restauranteId,

    usuarioId: data.usuarioId,
    usuarioNombre: data.usuarioNombre,

    calificacion: data.calificacion,
    comentario,

    creadoEn: serverTimestamp(),
  },
);

return reviewRef.id;

return reviewRef.id;
}

// ─── Obtener reseñas ──────────────────────────────────────────────────────────

/**

* Obtiene todas las reseñas de un restaurante,
* ordenadas de más reciente a más antigua.
  */
  export async function getRestaurantReviews(
  restauranteId: string,
  ): Promise<Review[]> {
  const reviewsQuery = query(
  reviewsCol(restauranteId),
  orderBy("creadoEn", "desc"),
  );

const snapshot = await getDocs(reviewsQuery);

return snapshot.docs.map((reviewDoc) => ({
id: reviewDoc.id,
...(reviewDoc.data() as Omit<Review, "id">),
}));
}

// ─── Eliminar reseña ──────────────────────────────────────────────────────────

/**

* Elimina una reseña.
*
* Las reglas de Firestore garantizan que solamente
* el usuario propietario pueda eliminarla.
*
* Después de eliminarla, el componente que muestra
* las estadísticas puede volver a consultar las reseñas
* para obtener los valores actualizados.
  */
  export async function deleteReview(
  restauranteId: string,
  reviewId: string,
  ): Promise<void> {
  if (!restauranteId) {
  throw new Error(
  "El restaurante es obligatorio.",
  );
  }

if (!reviewId) {
throw new Error(
"La reseña es obligatoria.",
);
}

await deleteDoc(
reviewDocRef(
restauranteId,
reviewId,
),
);
}
