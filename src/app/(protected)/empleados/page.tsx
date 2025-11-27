"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Empleado } from "@/src/types/interfaces";

export default function ListaEmpleadosPage() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");

  //obtener empleados al inicio
  useEffect(() => {
    getEmpleados();
  }, []);

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setShowToast(true);
  
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  //obtener lista de empleados
  const getEmpleados = async () => {
    try {
      const res = await fetch("/api/empleados"); 
      const data = await res.json();
      if (Array.isArray(data)) setEmpleados(data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
    }
  };

  //eliminar empleado
  const eliminarEmpleado = async (id: number) => {
    if (!confirm("¿Desea eliminar este empleado?")) return;
    try {
      await fetch(`/api/empleados?id=${id}`, { method: "DELETE" });
      mostrarToast("Empleado eliminado correctamente");
      getEmpleados();

    } catch (err) {
      console.error("Error eliminando empleado:", err);
    }
  };



  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Empleados</h2>
        <Link href="/empleados/form_emp" className="btn btn-primary">
          <i className="bi bi-plus-square"> </i> Nuevo Empleado
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr className="table-dark text-center">
            <th>ID</th>
              <th>EnrollNumber</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Cargo</th>
              <th>Área</th>
              <th>Turno</th>
              <th>Sueldo</th>
              <th>Estado</th>
              <th>Estado Biométrico</th>
              <th colSpan={2}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.Id} className="text-center align-middle">
                <td className="nowrap">{emp.Id}</td>
                <td className="nowrap">{emp.EnrollNumber}</td>
                <td className="nowrap">{emp.Nombres}</td>
                <td className="nowrap">{emp.Apellidos}</td>
                <td className="nowrap">{emp.Documento}</td>
                <td className="nowrap">{emp.Telefono}</td>
                <td className="nowrap">{emp.Cargo}</td>
                <td className="nowrap">{emp.AreaEmp}</td>
                <td className="nowrap">{emp.TurnoEmp}</td>
                <td className="nowrap">L {emp.Sueldo}</td>
                <td>
                  <span
                    className={`badge fs-7 px-3 py-2 ${ emp.Estado === "Activo" ? "bg-success" : "bg-secondary" }`}>
                    {emp.Estado}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge fs-7 px-3 py-2 ${ emp.EstadoBiometrico === "Registrado" ? "bg-primary" : "bg-danger" }`}>
                    {emp.EstadoBiometrico}
                  </span>
                </td>
                <td className="text-center">
                <Link href={`/empleados/form_emp?id=${emp.Id}`} passHref>
                  <button className="btn btn-warning btn-sm">
                    <i className="bi bi-pencil"></i> Actualizar
                  </button>
                </Link>
                </td>
                <td className="text-center">
                  <button className="btn btn-danger btn-sm" onClick={() => eliminarEmpleado(emp.Id)}>
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show border-0 text-dark" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-secondary bg-opacity-25">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <strong className="me-auto">Notificación</strong>
              <button type="button" className="btn-close ms-2 mb-1"naria-label="Close" onClick={() => setShowToast(false)}></button>
            </div>
            <div className="toast-body fs-7 text-center">{toastMensaje}</div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}