"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  LogIn,
  LogOut,
  MapPin,
  User,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const isHomePage = pathname === "/";
  const isRestaurantDashboard = pathname === "/restaurant";
  const isReservationsPage = pathname === "/reservations";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();

      setShowUserMenu(false);
      router.push("/login");
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="mc-header">
      <div className="mc-header__container">
        {/* Logo */}
        <Link href="/" className="mc-header__logo">
          <UtensilsCrossed className="mc-header__logo-icon" />

          <span className="mc-header__logo-text">
            MesaCerca
          </span>
        </Link>

        {/* Navigation */}
        <nav className="mc-header__nav">
          {/* Explorar */}
          <Link
            href="/"
            className={`mc-nav-link ${
              isHomePage ? "mc-nav-link--active" : ""
            }`}
          >
            <MapPin className="mc-nav-link__icon" />
            <span>Explorar</span>
          </Link>

          {/* Panel restaurante */}
          {user?.rol === "restaurante" && (
            <Link
              href="/restaurant"
              className={`mc-nav-link ${
                isRestaurantDashboard
                  ? "mc-nav-link--active"
                  : ""
              }`}
            >
              <Building2 className="mc-nav-link__icon" />
              <span>Panel Restaurante</span>
            </Link>
          )}

          {/* Usuario */}
          {user ? (
            <div className="mc-user-menu">
              <button
                type="button"
                onClick={() =>
                  setShowUserMenu((current) => !current)
                }
                className="mc-user-menu__trigger"
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-label="Abrir menú de usuario"
              >
                <User className="mc-user-menu__trigger-icon" />

                <span>
                  {user.name?.split(" ")[0] || "Usuario"}
                </span>
              </button>

              {showUserMenu && (
                <>
                  {/* Click outside */}
                  <div
                    className="mc-user-menu__overlay"
                    onClick={() => setShowUserMenu(false)}
                    aria-hidden="true"
                  />

                  {/* Menu */}
                  <div
                    className="mc-user-menu__dropdown"
                    role="menu"
                  >
                    {/* Mis reservas */}
                    <Link
                      href="/reservations"
                      onClick={() => setShowUserMenu(false)}
                      className={`mc-user-menu__item ${
                        isReservationsPage
                          ? "mc-user-menu__item--active"
                          : ""
                      }`}
                      role="menuitem"
                    >
                      <CalendarDays />
                      <span>Mis reservas</span>
                    </Link>

                    {/* Mi perfil */}
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="mc-user-menu__item"
                      role="menuitem"
                    >
                      <User />
                      <span>Mi Perfil</span>
                    </Link>

                    {/* Cerrar sesión */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="mc-user-menu__item mc-user-menu__item--danger"
                      role="menuitem"
                    >
                      <LogOut />

                      <span>
                        {isLoggingOut
                          ? "Cerrando sesión..."
                          : "Cerrar Sesión"}
                      </span>
                    </button>

                    {/* Error */}
                    {logoutError && (
                      <p className="mc-user-menu__error">
                        {logoutError}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Ingresar */}
              <Link
                href="/login"
                className="mc-nav-link"
              >
                <LogIn className="mc-nav-link__icon" />
                <span>Ingresar</span>
              </Link>

              {/* Registrarse */}
              <Link
                href="/register"
                className="mc-button mc-button--primary mc-button--medium"
              >
                <UserPlus />
                <span>Registrarse</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}