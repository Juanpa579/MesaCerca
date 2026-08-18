"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RestaurantRouteProps {
  children: React.ReactNode;
}

export function RestaurantRoute({
  children,
}: RestaurantRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.rol !== "restaurante") {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== "restaurante") {
    return null;
  }

  return <>{children}</>;
}