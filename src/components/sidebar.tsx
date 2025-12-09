"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/src/context/UserContext";
import { useState } from "react";
import Logo from "@/src/app/assets/images/logo.png";


export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, loading } = useUser();
  const [open, setOpen] = useState(false);

  if (loading || !currentUser) return null;

  const menu = [
    { name: "Áreas", path: "/areas" },
    { name: "Turnos", path: "/turnos" },
    { name: "Empleados", path: "/empleados" },
    { name: "Registros", path: "/registros" },
    { name: "Usuarios", path: "/usuarios_sistema" },
  ];

  return (
    <>
    <div className="mobile-topbar d-md-none">
      <button className="btn btn-dark ms-auto" onClick={() => setOpen(!open)}>
        ☰ Menú
      </button>
    </div>

    {open && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={() => setOpen(false)}
        />
    )}

<div className={`sidebar-container ${open ? "open" : ""}`}>
        <div className="text-center mb-3 mt-3">
          <img src={Logo.src} alt="logo" style={{ width: "120px" }} />
        </div>

        <h5 className="text-center mb-4">Sistema de Asistencia</h5>

        <ul className="nav flex-column mb-auto px-2">
          {menu.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <Link
                href={item.path}
                className={`nav-link ${
                  pathname === item.path ? "bg-secondary text-white" : "text-light"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="btn btn-danger mt-auto w-100"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Cerrar sesión
        </button>

        <div className="text-center mt-3 small">
          Usuario: <strong>{currentUser.name}</strong>
          <br />
          Rol: <strong>{currentUser.role}</strong>
        </div>
      </div>
    </>
  );
}
