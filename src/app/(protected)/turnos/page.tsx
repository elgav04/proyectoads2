"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Turno } from "@/src/types/interfaces";

export default function AreasPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const [newTurno, setNewTurno] = useState<Turno>({
    Id: 0,
    Nombre: "",
    HoraEntrada: "",
    HoraSalida: "",
    Estado: "Activo",
  });

  //estados para modal, mensaje, edicion
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditingId] = useState<number | null>(null);

  //obtener turnos al inicio
  useEffect(() => {
    getTurnos();
  }, []);

  const limpiarFormulario = () => {
    setNewTurno({
      Id: 0,
      Nombre: "",
      HoraEntrada: "",
      HoraSalida: "",
      Estado: "Activo",
    });
    setEditingId(null);
    setEditMode(false);
  };

  //para actualizar el valor en el objeto si se cambia en el html
  const updatevalorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTurno((anterior) => ({ ...anterior, [name]: value }));
  };

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setShowToast(true);
  
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Obtener lista de turnos
  const getTurnos = async () => {
    try {
      const res = await fetch("/api/turnos");
      const data = await res.json();

      if (Array.isArray(data)) setTurnos(data);

    } catch (err) {
      console.error("Error cargando turnos:", err);
    }
  };

  // Crear nuevo turno
  const guardarTurno = async () => {
    try {
      await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTurno),
      });
      limpiarFormulario();
      setShowModal(false);
      mostrarToast("Turno registrado correctamente");
      getTurnos();

    } catch (err) {
      console.error("Error agregando turnos:", err);
    }
  };

  // actualizar turno 
  const actualizarTurno = async () => {
    if (editId === null) return;
    try {
      await fetch(`/api/turnos?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTurno),
      });
      limpiarFormulario();
      setShowModal(false);
      mostrarToast("Turno actualizado correctamente");
      getTurnos();

    } catch (err) {
      console.error("Error actualizando turno:", err);
    }
  };

  // eliminar turno
  const eliminarTurno = async (id: number) => {
    if (!confirm("¿Desea eliminar este turno?")) return;
    try {
      await fetch(`/api/turnos?id=${id}`, { method: "DELETE" });
      mostrarToast("Turno eliminado correctamente");
      getTurnos();

    } catch (err) {
      console.error("Error eliminando turno:", err);
    }
  };

  //abrir modal para crear
  const abrirFormulario = () => {
    limpiarFormulario();
    setShowModal(true);
  };

  //abrir modal para editar
  const abrirFormularioEditar = async (id: number) => {
    try {
      const res = await fetch(`/api/turnos?id=${id}`);
      const data: Turno = await res.json();
      setNewTurno({ ...data, Estado: "Activo" });
      setEditingId(id);
      setEditMode(true);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando turno:", err);
    }
  };

  

  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Turnos</h2>
        <button className="btn btn-primary" onClick={abrirFormulario}>
          <i className="bi bi-plus-square"> </i> Nuevo Turno
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr className="text-center">
              <th>ID</th>
              <th>Nombre</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Estado</th>
              <th colSpan={2}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((a) => {
              //console.log("Turnos prueba:", a); 
              return (
                <tr key={a.Id} className="align-middle">
                  <td className="text-center">{a.Id}</td>
                  <td className="text-center">{a.Nombre}</td>
                  <td className="text-center">{a.HoraEntrada?.slice(0, 5)}</td>
                  <td className="text-center">{a.HoraSalida?.slice(0, 5)}</td>
                  <td className="text-center">
                    <span className={`badge fs-7 px-3 py-2 ${a.Estado === "Activo" ? "bg-success" : "bg-secondary"}`}>
                      {a.Estado}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-warning btn-sm" onClick={() => abrirFormularioEditar(a.Id)}>
                      <i className="bi bi-pencil"></i> Actualizar
                    </button>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-danger btn-sm" onClick={() => eliminarTurno(a.Id)}>
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Modal edicion */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? "Actualizar Turno" : "Agregar Nuevo Turno"}</h5>
              <button className="modal-close"onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <label>Nombre del turno</label>
              <input type="text" name="Nombre" className="form-control" placeholder="Ingrese el nombre del turno" value={newTurno.Nombre} onChange={updatevalorChange}/>
            </div>

            <div className="modal-body">
                <label>Hora de entrada</label>
                <input type="time" name="HoraEntrada" className="form-control" value={newTurno.HoraEntrada} onChange={updatevalorChange}/>
            </div>

            <div className="modal-body">
                <label>Hora de salida</label>
                <input type="time" name="HoraSalida" className="form-control" value={newTurno.HoraSalida} onChange={updatevalorChange}/>
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                Cancelar
              </button>
              <button
                className="btn btn-success" onClick={editMode ? actualizarTurno : guardarTurno} disabled={!newTurno.Nombre.trim() || !newTurno.HoraEntrada ||  !newTurno.HoraSalida} >
                {editMode ? "Actualizar" : "Guardar"}
              </button>
            </div>
            
          </div>
        </div>
      )}

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
