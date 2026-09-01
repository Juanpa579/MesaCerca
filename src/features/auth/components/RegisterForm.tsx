"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2,
  Utensils,
  FileText,
  X,
  Upload,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface RegisterFormData {
  nombre: string;
  correo: string;
  celular: string;
  password: string;
  confirmarPassword: string;
}

interface RegisterFormErrors {
  nombre?: string;
  correo?: string;
  celular?: string;
  password?: string;
  confirmarPassword?: string;
  documentos?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc"];
const MAX_FILE_SIZE_KB = 700;

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isValidFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const sizeKB = file.size / 1024;

  return (
    ALLOWED_EXTENSIONS.includes(extension) &&
    sizeKB <= MAX_FILE_SIZE_KB
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: "",
    correo: "",
    celular: "",
    password: "",
    confirmarPassword: "",
  });

  const [formErrors, setFormErrors] =
    useState<RegisterFormErrors>({});

  const [isRestaurant, setIsRestaurant] = useState(false);
  const [legalFiles, setLegalFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    field: keyof RegisterFormData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = Array.from(event.target.files ?? []);

    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of selected) {
      if (isValidFile(file)) {
        valid.push(file);
      } else {
        errors.push(
          `El archivo ${file.name} no es válido. Solo se aceptan PDF, JPG, PNG o DOC de máximo 700KB.`,
        );
      }
    }

    setFileErrors(errors);

    if (valid.length > 0) {
      setLegalFiles((previous) => {
        const names = new Set(previous.map((file) => file.name));

        return [
          ...previous,
          ...valid.filter((file) => !names.has(file.name)),
        ];
      });

      setFormErrors((previous) => ({
        ...previous,
        documentos: undefined,
      }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (name: string) => {
    setLegalFiles((previous) =>
      previous.filter((file) => file.name !== name),
    );
  };

  const handleRestaurantChange = (checked: boolean) => {
    setIsRestaurant(checked);

    if (!checked) {
      setLegalFiles([]);
      setFileErrors([]);

      setFormErrors((previous) => ({
        ...previous,
        documentos: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const errors: RegisterFormErrors = {};

    const nombre = formData.nombre.trim();
    const correo = formData.correo.trim();
    const celular = formData.celular.trim();

    // Nombre
    if (!nombre) {
      errors.nombre = "El nombre completo es obligatorio";
    } else if (/^\d+$/.test(nombre)) {
      errors.nombre = "El nombre no puede contener solo números";
    } else if (nombre.length < 5 || nombre.length > 100) {
      errors.nombre =
        "El nombre debe tener entre 5 y 100 caracteres";
    } else if (
      nombre.split(/\s+/).filter(Boolean).length < 2
    ) {
      errors.nombre =
        "Ingresa al menos un nombre y un apellido";
    }

    // Correo
    if (!correo) {
      errors.correo = "El correo es obligatorio";
    } else if (!EMAIL_REGEX.test(correo)) {
      errors.correo =
        "El correo no tiene un formato válido";
    }

    // Celular
    if (!celular) {
      errors.celular = "El número de celular es obligatorio";
    } else if (!PHONE_REGEX.test(celular)) {
      errors.celular =
        "El celular debe contener exactamente 10 dígitos numéricos";
    }

    // Contraseña
    if (!formData.password) {
      errors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      errors.password =
        "La contraseña debe tener mínimo 6 caracteres";
    }

    // Confirmación
    if (!formData.confirmarPassword) {
      errors.confirmarPassword =
        "Debes confirmar la contraseña";
    } else if (
      formData.password !== formData.confirmarPassword
    ) {
      errors.confirmarPassword =
        "Las contraseñas no coinciden";
    }

    // Documentos
    if (isRestaurant && legalFiles.length === 0) {
      errors.documentos =
        "Debes adjuntar al menos un documento legal";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    if (!validate() || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.nombre.trim(),
        formData.correo.trim(),
        formData.celular.trim(),
        formData.password,
        isRestaurant,
        legalFiles,
      );

      setSuccessMessage(
        "Tu cuenta ha sido creada con éxito",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Error inesperado",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-orange-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Crear Cuenta
        </h1>

        <p className="text-slate-600">
          Únete a MesaCerca y reserva en tus restaurantes
          favoritos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Server error */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <span className="text-sm">
              {serverError}
            </span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0" />

            <span className="text-sm">
              {successMessage}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre Completo
            </label>

            <input
              type="text"
              value={formData.nombre}
              onChange={(event) =>
                handleChange(
                  "nombre",
                  event.target.value,
                )
              }
              disabled={isLoading}
              placeholder="Juan Pérez"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                formErrors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-orange-500"
              }`}
            />

            {formErrors.nombre && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>

            <input
              type="email"
              value={formData.correo}
              onChange={(event) =>
                handleChange(
                  "correo",
                  event.target.value,
                )
              }
              disabled={isLoading}
              placeholder="tu@email.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                formErrors.correo
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-orange-500"
              }`}
            />

            {formErrors.correo && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.correo}
              </p>
            )}
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Celular
            </label>

            <input
              type="tel"
              inputMode="numeric"
              value={formData.celular}
              onChange={(event) =>
                handleChange(
                  "celular",
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10),
                )
              }
              disabled={isLoading}
              placeholder="3001234567"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                formErrors.celular
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-orange-500"
              }`}
            />

            {formErrors.celular && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.celular}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Contraseña
            </label>

            <input
              type="password"
              value={formData.password}
              onChange={(event) =>
                handleChange(
                  "password",
                  event.target.value,
                )
              }
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                formErrors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-orange-500"
              }`}
            />

            {formErrors.password ? (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.password}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Confirmar Contraseña
            </label>

            <input
              type="password"
              value={formData.confirmarPassword}
              onChange={(event) =>
                handleChange(
                  "confirmarPassword",
                  event.target.value,
                )
              }
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-slate-50 ${
                formErrors.confirmarPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-orange-500"
              }`}
            />

            {formErrors.confirmarPassword && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.confirmarPassword}
              </p>
            )}
          </div>

          {/* Restaurante */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRestaurant}
                onChange={(event) =>
                  handleRestaurantChange(
                    event.target.checked,
                  )
                }
                disabled={isLoading}
                className="mt-0.5 w-4 h-4 rounded accent-orange-500"
              />

              <div>
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  Soy un restaurante
                </span>

                <p className="text-xs text-slate-500 mt-1">
                  Marca esta opción si deseas gestionar un
                  restaurante y acceder al panel de
                  administración.
                </p>
              </div>
            </label>
          </div>

          {/* Documentos legales */}
          {isRestaurant && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <FileText className="w-4 h-4 text-orange-500" />
                Documentos Legales
              </h3>

              <p className="text-xs text-slate-600 mb-3">
                Para verificar la veracidad de tu restaurante,
                debes subir documentos legales (RUT, Cámara
                de Comercio, etc.)
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isLoading}
                className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 transition-colors disabled:opacity-60 ${
                  formErrors.documentos
                    ? "border-red-400 bg-red-50"
                    : "border-orange-300 hover:border-orange-400 bg-white"
                }`}
              >
                <Upload className="w-6 h-6 text-orange-400" />

                <span className="text-sm font-medium text-slate-700">
                  Haz clic para subir archivos
                </span>

                <span className="text-xs text-slate-500">
                  PDF, JPG, PNG, DOC (máx. 700KB)
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc"
                onChange={handleFileSelect}
                className="hidden"
              />

              {fileErrors.map((error, index) => (
                <p
                  key={index}
                  className="mt-1 text-xs text-red-600"
                >
                  {error}
                </p>
              ))}

              {formErrors.documentos && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.documentos}
                </p>
              )}

              {legalFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {legalFiles.map((file) => (
                    <li
                      key={file.name}
                      className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-slate-700 truncate flex-1">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(file.name)
                        }
                        disabled={isLoading}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}