// Servicio de autenticación: aísla toda la interacción con Firebase Authentication.
// Los componentes visuales nunca llaman al SDK directamente; solo consumen este módulo.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import type {
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../config/firebase";

/**
 * Traduce los códigos técnicos de Firebase a mensajes funcionales en español.
 * Se usa en todos los flujos (login, register, reset, update, delete).
 */
export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "El correo no tiene un formato válido.";
    case "auth/user-not-found":
      return "No existe una cuenta asociada a este correo.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña no cumple los requisitos de seguridad.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta de nuevo más tarde.";
    case "auth/network-request-failed":
      return "Error de conexión. Revisa tu internet.";
    case "auth/requires-recent-login":
      return "Por seguridad debes iniciar sesión nuevamente antes de continuar.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    default:
      return "Ocurrió un error inesperado. Intenta de nuevo.";
  }
}

/** Crea una cuenta en Firebase Authentication. Devuelve el usuario creado. */
export async function registerWithEmailPassword(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Inicia sesión con correo y contraseña. */
export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Cierra la sesión activa. */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/** Envía correo de recuperación de contraseña. */
export async function sendResetPasswordEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Reautentica al usuario con su contraseña actual.
 * Firebase exige reautenticación reciente antes de cambiar contraseña o borrar cuenta.
 */
export async function reauthenticateCurrentUser(currentPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No hay usuario autenticado.");
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

/** Actualiza la contraseña del usuario autenticado (debe haberse reautenticado antes). */
export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado.");
  }
  await fbUpdatePassword(user, newPassword);
}

/** Elimina la cuenta del usuario autenticado (debe haberse reautenticado antes). */
export async function deleteCurrentUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado.");
  }
  await deleteUser(user);
}

/** Suscripción al cambio de estado de autenticación. Devuelve la función de unsubscribe. */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
