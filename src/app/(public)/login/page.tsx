"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Alert } from "react-bootstrap";
import "./login.css";

import BackgroundImage from "@/src/app/assets/images/background.jpg"; 
import Logo from "@/src/app/assets/images/logo.png";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      Usuario: usuario,
      Clave: clave,
    });

    setLoading(false);

    //errores login
    if (res?.error) {
      switch (res.error) {
        case "invalid":
          setError("Usuario o contraseña incorrectos");
          break;
        case "blocked":
          setError("Usuario no permitido o inactivo");
          break;
        case "server":
          setError("No se pudo validar con el servidor, intente más tarde");
          break;
        default:
          setError("Error desconocido");
      }
    } else {
      router.push("/"); //redirir
    }
  };

  return (
    <div
      className="sign-in__wrapper"
      style={{ backgroundImage: `url(${BackgroundImage.src})` }}
    >
      <div className="sign-in__backdrop"></div>
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
   
        <img className=" mx-auto d-block mb-2" src={Logo.src} alt="logo" />
        <div className="h4 mb-2 text-center">Iniciar Sesión</div>

 
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <Form.Group className="mb-2" controlId="username">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={usuario}
            placeholder="Usuario"
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={clave}
            placeholder="Contraseña"
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </Form.Group>

        {/* Botón */}
        <Button className="w-100" variant="primary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>

        {/* Footer */}
        <div className="w-100 mb-2 position-absolute bottom-0 start-50 translate-middle-x text-white text-center">
          Grupo 1 - Análisis y Diseño de Sistemas II 2025-3
        </div>
      </Form>
    </div>
  );
}
