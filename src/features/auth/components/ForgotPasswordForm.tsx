"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  LockKeyhole,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ForgotPasswordFormErrors {
  correo?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] =
    useState<ForgotPasswordFormErrors>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errors: ForgotPasswordFormErrors = {};
    const email = correo.trim();

    if (!email) {
      errors.correo = "El correo es obligatorio";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.correo = "El correo no tiene un formato válido";
    }

    setFormError(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!validate() || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(correo.trim());
      setSuccess(true);
      setCorreo("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de recuperación",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockKeyhole className="w-8 h-8 text-orange-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Recuperar contraseña
          </h1>

          <p className="text-slate-600">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error del servidor */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Éxito */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />

              <span className="text-sm">
                Si existe una cuenta asociada a ese correo, recibirás un
                enlace para recuperar tu contraseña.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-semibold text-slate-900 mb-2"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => {
                  setCorreo(event.target.value);

                  if (formError.correo) {
                    setFormError({});
                  }

                  if (error) {
                    setError("");
                  }

                  if (success) {
                    setSuccess(false);
                  }
                }}
                disabled={isLoading}
                placeholder="tu@email.com"
                autoComplete="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                  formError.correo
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-orange-500"
                }`}
              />

              {formError.correo && (
                <p className="mt-1 text-xs text-red-600">
                  {formError.correo}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}