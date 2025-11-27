"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { Empleado } from "@/src/types/interfaces";

export default function FormEmpleadoPage() {
  const searchParams = useSearchParams();
  const idParametro = searchParams.get("id"); 
  const isEdit = !!idParametro;

  const [newEmpleado, setNewEmpleado] = useState<any>({
    Id: 0,
    EnrollNumber: "",
    Nombres: "",
    Apellidos: "",
    Documento: "",
    Direccion: "",
    Telefono: "",
    Fechaingreso: "",
    Id_Area: 0,
    Id_Turno: 0,
    Cargo: "",
    Sueldo: 0,
    Estado: "Activo",
    EstadoBiometrico: "Pendiente",
    AreaEmp: "",   
    TurnoEmp: ""  
  });

  //estados para listas, mensaje, edicion
  const [areasList, setAreasList] = useState<{Id: number, Nombre: string}[]>([]);
  const [turnosList, setTurnosList] = useState<{Id: number, Nombre: string}[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");
  const [editMode, setEditMode] = useState(false);

  //obtener listas areas, turnos
  useEffect(() => {

    fetch("/api/areas")
      .then(res => res.json())
      .then((data) => setAreasList(data.filter((a: any) => a.Estado === "Activo")))
      .catch(err => console.error("Error cargando areas:", err));

    fetch("/api/turnos")
      .then(res => res.json())
      .then((data) => setTurnosList(data.filter((t: any) => t.Estado === "Activo")))
      .catch(err => console.error("Error cargando turnos:", err));
  }, []);

  //obtener info para edicion si viene un id
  useEffect(() => {
    if (isEdit && areasList.length > 0 && turnosList.length > 0) {
      fetch(`/api/empleados?id=${idParametro}`)
        .then(res => res.json())
        .then((data: any) => {
          
          // convertir fecha
          const fechaformateada = data.Fechaingreso ? new Date(data.Fechaingreso).toISOString().split("T")[0] : "";

          //verificar si area, turno inactivos
          const areaInactiva = !areasList.some(a => a.Id === data.Id_Area);
          const turnoInactivo = !turnosList.some(t => t.Id === data.Id_Turno);
    
          setNewEmpleado({
            ...data,
            Fechaingreso: fechaformateada,
            AreaEmp: data.Id_Area ?? 0,
            TurnoEmp: data.Id_Turno ?? 0
          });

          if (areaInactiva || turnoInactivo) {
            mostrarToast("El área o turno original del empleado está inactivo. Por favor seleccione uno válido.");
          }
        
          setEditMode(true);
        })
        .catch(err => console.error(err));
    }
  }, [areasList, turnosList, idParametro]);

  //obtener ultimo EnrollNumber si es creacion
  useEffect(() => {
    if (!isEdit) {
      fetch("/api/empleados/nextenroll")
        .then(res => res.json())
        .then(data => {
          setNewEmpleado((anterior: any) => ({ ...anterior, EnrollNumber: data.siguiente }));
        });
    }
  }, [isEdit]);

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  //para actualizar el valor en el objeto si se cambia en el html
  const updateValorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmpleado((anterior: any) => ({ ...anterior, [name]: value }));
  };

  //funcion para formatear lo que se enviara al backend
  const mapEmpleadoForDB = (empleado: any) => {
    return {
      Id: empleado.Id,
      EnrollNumber: empleado.EnrollNumber,
      Nombres: empleado.Nombres,
      Apellidos: empleado.Apellidos,
      Documento: empleado.Documento,
      Direccion: empleado.Direccion,
      Telefono: empleado.Telefono,
      Fechaingreso: empleado.Fechaingreso,
      Id_Area: Number(empleado.AreaEmp),  
      Id_Turno: Number(empleado.TurnoEmp), 
      Cargo: empleado.Cargo,
      Sueldo: empleado.Sueldo,
      Estado: "Activo",
      EstadoBiometrico: empleado.EstadoBiometrico
    };
  };

  //guardar empleado
  const guardarEmpleado = async () => {
    try {
      const body = mapEmpleadoForDB(newEmpleado);

      const res = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      mostrarToast("Empleado registrado correctamente");

      window.location.href = `/empleados/form_emp?id=${data.id}`;
    } catch (err) {
      console.error(err);
      mostrarToast("Error al guardar empleado");
    }
  };

  //actualizar empleado
  const actualizarEmpleado = async () => {
    if (!idParametro) return;
  
    try {
      const body = mapEmpleadoForDB(newEmpleado);
  
      await fetch(`/api/empleados?id=${idParametro}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      mostrarToast("Empleado actualizado correctamente");
    } catch (err) {
      console.error(err);
      mostrarToast("Error al actualizar empleado");
    }
  };

  //para validar el formulario
  const formValido = () => {
    const areaValida = areasList.some(a => a.Id === Number(newEmpleado.AreaEmp));
    const turnoValido = turnosList.some(t => t.Id === Number(newEmpleado.TurnoEmp));

    return (
      newEmpleado.Nombres.trim() !== "" &&
      newEmpleado.Apellidos.trim() !== "" &&
      /^[0-9]{1,20}$/.test(newEmpleado.Documento) &&
      /^\d{4}-\d{2}-\d{2}$/.test(newEmpleado.Fechaingreso) &&
      areaValida &&
      turnoValido &&
      newEmpleado.Sueldo > 0
    );
  };

  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{editMode ? "Editar Empleado" : "Agregar Empleado"}</h2>
        <Link href="/empleados" className="btn btn-secondary">
          <i className="bi bi-arrow-left"> </i> Volver
        </Link>
      </div>

      <form>
        <div className="row g-3 mt-1">
          <div className="col-md-3">
            <label className="form-label">EnrollNumber</label>
            <input type="text" name="EnrollNumber" className="form-control bg-body-secondary" value={newEmpleado.EnrollNumber} readOnly required/>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <span><b>Datos personales</b></span>
          <div className="col-md-4">
            <label className="form-label">Nombres:</label>
            <input type="text" name="Nombres" className="form-control" value={newEmpleado.Nombres} onChange={updateValorChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Apellidos:</label>
            <input type="text" name="Apellidos" className="form-control" value={newEmpleado.Apellidos} onChange={updateValorChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">DNI:</label>
            <input type="text" name="Documento" className="form-control" value={newEmpleado.Documento}
            onChange={(e) => {
              const reglasDNI = /^[0-9]{0,20}$/;
              if (reglasDNI.test(e.target.value)) updateValorChange(e);
            }} required />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label">Dirección:</label>
            <input type="text" name="Direccion" className="form-control" value={newEmpleado.Direccion} onChange={updateValorChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Teléfono:</label>
            <input type="text" name="Telefono" className="form-control" value={newEmpleado.Telefono} onChange={updateValorChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Fecha de Ingreso:</label>
            <input type="date" name="Fechaingreso" className="form-control" value={newEmpleado.Fechaingreso} onChange={updateValorChange} required />
          </div>
        </div>

        <hr/>

        <div className="row g-3 mt-1">
          <span><b>Datos de rango</b></span>
          <div className="col-md-4">
            <label className="form-label">Área:</label>
            <select name="AreaEmp" className="form-select" value={newEmpleado.AreaEmp} onChange={updateValorChange} required>
                <option value={0}>-- Seleccione un área --</option>
                {areasList.map((a) => (
                <option key={a.Id} value={a.Id}>{a.Nombre}</option>
                ))}
            </select>
            </div>

            <div className="col-md-4">
            <label className="form-label">Turno:</label>
            <select name="TurnoEmp" className="form-select" value={newEmpleado.TurnoEmp} onChange={updateValorChange} required>
                <option value={0}>-- Seleccione un turno --</option>
                {turnosList.map((t) => (
                <option key={t.Id} value={t.Id}>{t.Nombre}</option>
                ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Cargo:</label>
            <input type="text" name="Cargo" className="form-control" value={newEmpleado.Cargo} onChange={updateValorChange} required />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Sueldo:</label>
            <div className="input-group">
              <span className="input-group-text">L</span>
              <input type="text" name="Sueldo" className="form-control"
                value={newEmpleado.Sueldo === 0 ? "" : newEmpleado.Sueldo.toString()}
                onChange={(e) => {
                  const valor = e.target.value;
                  const reglasSueldo = /^[0-9]*\.?[0-9]*$/; 
                  if (reglasSueldo.test(valor)) {
                    updateValorChange(e);
                  }
                }}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value);
                  setNewEmpleado({ ...newEmpleado, Sueldo: isNaN(valor) ? 0 : parseFloat(valor.toFixed(2)) });
                }}
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-8"></div>
          <div className="col-md-4 d-flex justify-content-end">
            <button type="button" className="btn btn-success w-100" onClick={editMode ? actualizarEmpleado : guardarEmpleado} disabled={!formValido()}>
              {editMode ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      </form>

      {showToast && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show border-0 text-dark" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-secondary bg-opacity-25">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <strong className="me-auto">Notificación</strong>
              <button type="button" className="btn-close ms-2 mb-1" aria-label="Close" onClick={() => setShowToast(false)}></button>
            </div>
            <div className="toast-body fs-7 text-center">{toastMensaje}</div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
