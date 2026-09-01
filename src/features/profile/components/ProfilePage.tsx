"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ProfilePage() {
  const {
    user,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useAuth();

  // -------------------------
  // Profile
  // -------------------------

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // -------------------------
  // Password
  // -------------------------

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // -------------------------
  // Delete account
  // -------------------------

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // -------------------------
  // Update profile
  // -------------------------

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setProfileError("El nombre es obligatorio.");
      return;
    }

    if (trimmedName.length < 5) {
      setProfileError("El nombre debe tener al menos 5 caracteres.");
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setProfileError(
        "El celular debe contener exactamente 10 dígitos.",
      );
      return;
    }

    setProfileLoading(true);

    try {
      await updateProfile(trimmedName, trimmedPhone);
      setProfileSuccess("Tu información ha sido actualizada.");
    } catch (err) {
      setProfileError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la información.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // -------------------------
  // Update password
  // -------------------------

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Ingresa tu contraseña actual.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Ingresa una nueva contraseña.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "La nueva contraseña debe tener mínimo 6 caracteres.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "La nueva contraseña debe ser diferente a la actual.",
      );
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Tu contraseña ha sido actualizada.");
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // -------------------------
  // Delete account
  // -------------------------

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Ingresa tu contraseña para eliminar la cuenta.");
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteAccount(deletePassword);
      // AuthContext se encargará de actualizar el estado de autenticación.
      // ProtectedRoute redirigirá al usuario cuando ya no exista sesión.
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la cuenta.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Mi Perfil
          </h1>

          <p className="mt-2 text-slate-600">
            Administra tu información personal y la seguridad de tu cuenta.
          </p>
        </div>

        <div className="space-y-6">
          {/* Información personal */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Información personal
                </h2>

                <p className="text-sm text-slate-500">
                  Actualiza tus datos personales.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{profileSuccess}</span>
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
              noValidate
            >
              {/* Nombre */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={profileLoading}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 cursor-not-allowed"
                />

                <p className="mt-1 text-xs text-slate-500">
                  El correo está asociado a tu cuenta de Firebase y no puede
                  modificarse desde aquí.
                </p>
              </div>

              {/* Celular */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Celular
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    )
                  }
                  disabled={profileLoading}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Rol
                </label>

                <div className="px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 capitalize">
                  {user.rol}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar cambios
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Seguridad */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Seguridad
                </h2>

                <p className="text-sm text-slate-500">
                  Cambia la contraseña de tu cuenta.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{passwordSuccess}</span>
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
              noValidate
            >
              {/* Current password */}
              <PasswordInput
                id="current-password"
                label="Contraseña actual"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggleVisibility={() =>
                  setShowCurrentPassword((value) => !value)
                }
                disabled={passwordLoading}
              />

              {/* New password */}
              <PasswordInput
                id="new-password"
                label="Nueva contraseña"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggleVisibility={() =>
                  setShowNewPassword((value) => !value)
                }
                disabled={passwordLoading}
              />

              {/* Confirm */}
              <PasswordInput
                id="confirm-password"
                label="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((value) => !value)
                }
                disabled={passwordLoading}
              />

              <p className="text-xs text-slate-500">
                La contraseña debe tener mínimo 6 caracteres.
              </p>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Cambiar contraseña
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Danger zone */}
          <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Zona de peligro
                </h2>

                <p className="text-sm text-slate-500">
                  La eliminación de la cuenta es permanente.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{deleteError}</span>
              </div>
            )}

            <div className="space-y-4">
              <PasswordInput
                id="delete-password"
                label="Contraseña"
                value={deletePassword}
                onChange={setDeletePassword}
                visible={showDeletePassword}
                onToggleVisibility={() =>
                  setShowDeletePassword((value) => !value)
                }
                disabled={deleteLoading}
              />

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Eliminar mi cuenta
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  disabled: boolean;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  disabled,
}: PasswordInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-900 mb-2"
      >
        <Lock className="w-4 h-4 inline mr-2" />
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          autoComplete="current-password"
          className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}