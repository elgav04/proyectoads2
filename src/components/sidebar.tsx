"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/src/context/UserContext";

import Logo from "@/src/app/assets/images/logo.png";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, loading } = useUser();

  if (loading) return null; 
  if (!currentUser) return null;

  const menu = [
    { name: "Áreas", path: "/areas" },
    { name: "Turnos", path: "/turnos" },
    { name: "Empleados", path: "/empleados" },
    { name: "Registros", path: "/registros" },
    { name: "Usuarios", path: "/usuarios_sistema" },
  ];

  return (
    <div
      className="bg-dark text-light d-flex flex-column p-3"
      style={{
        width: "230px",
        height: "100vh",       
        position: "fixed",   
        top: 0,
        left: 0,
      }}
    >
      <div className="text-center mb-3">
        <img
          src={Logo.src}
          alt="logo"
          style={{ width: "120px", height: "auto" }} 
        />
      </div>

      <h5 className="text-center mb-4">Sistema de Asistencia</h5>

      <ul className="nav flex-column mb-auto">
        {menu.map((item) => (
          <li key={item.path} className="nav-item mb-2">
            <Link
              href={item.path}
              className={`nav-link ${
                pathname === item.path ? "bg-secondary text-white" : "text-light"
              }`}
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
        <br/>
        Rol: <strong>{currentUser.role}</strong>
      </div>
    </div>
  );
}
