// Contexto global de autenticación.
// - Se suscribe a onAuthStateChanged para mantener la sesión sincronizada con Firebase.
// - Carga el perfil de Firestore cuando hay un usuario autenticado.
// - Los archivos (documentos legales) se convierten a base64 y se guardan en Firestore.
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  registerWithEmailPassword,
  loginWithEmailPassword,
  logoutUser,
  sendResetPasswordEmail,
  reauthenticateCurrentUser,
  updateUserPassword,
  deleteCurrentUser,
  subscribeToAuthChanges,
  mapFirebaseAuthError,
} from "../services/authService";
import type { FirebaseUser } from "../services/authService";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../services/userService";
import type { UserProfile, UserRole } from "../services/userService";
import {
  createRestaurantProfile,
  convertLegalDocument,
} from "../services/restaurantService";

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  rol: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    isRestaurant?: boolean,
    legalFiles?: File[],
  ) => Promise<void>;
  logout: () => Promise<void>;

  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(fb: FirebaseUser, profile: UserProfile | null): AuthUser {
  return {
    uid: fb.uid,
    name: profile?.nombre ?? fb.displayName ?? "",
    email: profile?.correo ?? fb.email ?? "",
    phone: profile?.celular ?? "",
    rol: profile?.rol ?? "cliente",
  };
}

function rethrowMapped(err: unknown): never {
  const code = (err as { code?: string })?.code ?? "";
  const message = code
    ? mapFirebaseAuthError(code)
    : (err as Error)?.message ?? "Error inesperado";
  throw new Error(message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          setUser(toAuthUser(fbUser, profile));
        } catch {
          setUser(toAuthUser(fbUser, null));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await loginWithEmailPassword(email.trim(), password);
    } catch (err) {
      rethrowMapped(err);
    }
  }, []);

  const register = useCallback(
  async (
    name: string,
    email: string,
    phone: string,
    password: string,
    isRestaurant = false,
    legalFiles: File[] = [],
  ) => {
    let fbUser: FirebaseUser;

    try {
      fbUser = await registerWithEmailPassword(email.trim(), password);
    } catch (err) {
      rethrowMapped(err);
    }

    const uid = fbUser.uid;
    const rol: UserRole = isRestaurant ? "restaurante" : "cliente";


      // Paso 2: guardar datos en Firestore
      // Si esto falla, eliminamos el usuario de Auth para evitar registros huérfanos
      try {
        // Convierte documentos legales a base64 (sin Storage)
        let documentosLegales: { nombre: string; tipo: string; base64: string }[] = [];
        if (isRestaurant && legalFiles.length > 0) {
          documentosLegales = await Promise.all(
            legalFiles.map((f) => convertLegalDocument(f)),
          );
        }

        // Crea perfil en la colección usuarios
        await createUserProfile(uid, {
          nombre: name.trim(),
          correo: email.trim(),
          celular: phone.trim(),
          rol,
          documentosLegales,
        });

        // Si es restaurante, crea el documento base en restaurantes/
        if (isRestaurant) {
          await createRestaurantProfile(uid);
        }
      } catch (err) {
        // Revertir: eliminar el usuario de Auth para no dejar registros huérfanos
        try {
          await deleteCurrentUser();
        } catch {
          // Si el rollback también falla, lo ignoramos — el error original es el importante
        }
        // Propagar el error real de Firestore con mensaje claro
        const firestoreCode = (err as { code?: string })?.code ?? "";
        if (firestoreCode === "permission-denied") {
          throw new Error(
            "No se pudo guardar el perfil: permiso denegado en Firestore. Revisa las reglas de seguridad.",
          );
        }
        throw new Error(
          `Error al guardar el perfil: ${(err as Error)?.message ?? "error desconocido"}`,
        );
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      rethrowMapped(err);
    }
  }, []);

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await reauthenticateCurrentUser(currentPassword);
        await updateUserPassword(newPassword);
      } catch (err) {
        rethrowMapped(err);
      }
    },
    [],
  );

  const updateProfileFn = useCallback(
    async (name: string, phone: string) => {
      if (!user) throw new Error("No hay usuario autenticado.");
      try {
        await updateUserProfile(user.uid, {
          nombre: name.trim(),
          celular: phone.trim(),
        });
        setUser({ ...user, name: name.trim(), phone: phone.trim() });
      } catch (err) {
        rethrowMapped(err);
      }
    },
    [user],
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!user) throw new Error("No hay usuario autenticado.");
      try {
        await reauthenticateCurrentUser(password);
        await deleteUserProfile(user.uid);
        await deleteCurrentUser();
      } catch (err) {
        rethrowMapped(err);
      }
    },
    [user],
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendResetPasswordEmail(email.trim());
    } catch (err) {
      rethrowMapped(err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePassword,
        updateProfile: updateProfileFn,
        deleteAccount,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
