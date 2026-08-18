"use client";

import { useEffect, useState } from "react";
import {
  Store,
  UtensilsCrossed,
  CalendarDays,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { RestaurantProfileForm } from "./RestaurantProfileForm";
import { RestaurantMenu } from "./RestaurantMenu";
import { RestaurantReservations } from "./RestaurantReservations";

import {
  getRestaurantProfile,
} from "@/services/restaurantService";

import type {
  RestaurantProfile,
} from "@/services/restaurantService";

type DashboardSection = "perfil" | "menu" | "reservas";

export function RestaurantDashboard() {
  const { user } = useAuth();

  const [section, setSection] =
    useState<DashboardSection>("perfil");

  const [profile, setProfile] =
    useState<RestaurantProfile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const restaurantProfile =
          await getRestaurantProfile(user.uid);

        if (!cancelled) {
          if (restaurantProfile) {
            setProfile(restaurantProfile);
          } else {
            setProfileError(
              "No se encontró el perfil del restaurante.",
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el perfil del restaurante.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Panel del restaurante
          </h1>

          <p className="mt-2 text-slate-600">
            Gestiona la información, el menú y las reservas
            de tu restaurante.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

            {/* Información */}
            <button
              type="button"
              onClick={() => setSection("perfil")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                section === "perfil"
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Store className="h-5 w-5" />
              Información
            </button>

            {/* Menú */}
            <button
              type="button"
              onClick={() => setSection("menu")}
              className={`mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                section === "menu"
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <UtensilsCrossed className="h-5 w-5" />
              Menú
            </button>

            {/* Reservas */}
            <button
              type="button"
              onClick={() => setSection("reservas")}
              className={`mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                section === "reservas"
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CalendarDays className="h-5 w-5" />
              Reservas
            </button>

          </aside>

          {/* Contenido */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* Perfil */}
            {section === "perfil" && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Información del restaurante
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Actualiza la información que verán los clientes.
                  </p>
                </div>

                {loadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />

                      <span>
                        Cargando información del restaurante...
                      </span>
                    </div>
                  </div>
                ) : profileError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {profileError}
                  </div>
                ) : profile ? (
                  <RestaurantProfileForm
                    uid={user.uid}
                    profile={profile}
                    onProfileUpdated={setProfile}
                  />
                ) : null}
              </>
            )}

            {/* Menú */}
            {section === "menu" && (
              <RestaurantMenu uid={user.uid} />
            )}

            {/* Reservas */}
            {section === "reservas" && (
              <RestaurantReservations uid={user.uid} />
            )}

          </section>
        </div>
      </div>
    </div>
  );
}