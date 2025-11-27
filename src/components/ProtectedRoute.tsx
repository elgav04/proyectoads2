"use client";

import { useUser } from "@/src/context/UserContext";
import { usePathname } from "next/navigation";
import NoAutorizado from "./NoAutorizado";
import { PERMISOS_MENU } from "@/src/constants/permisos";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  const pathname = usePathname();

  if (loading) return null;

  //si no hay usuario logueado bloquear
  if (!currentUser) return <NoAutorizado />;

  const role = currentUser.role;
  const permisos = PERMISOS_MENU[role] || [];

  //si ruta no permitida bloquear
  if (!permisos.includes(pathname)) {
    return <NoAutorizado />;
  }

  return <>{children}</>;
}
