"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Area } from "@/src/types/interfaces";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);

  const [newArea, setNewArea] = useState<Area>({
    Id: 0,
    Nombre: "",
    Estado: "Activo",
  });

  //estados para modal, mensaje, edicion
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditingId] = useState<number | null>(null);

  //obtener areas al inicio
  useEffect(() => {
    getAreas();
  }, []);

  const limpiarFormulario = () => {
    setNewArea({
      Id: 0,
      Nombre: "",
      Estado: "Activo",
    });
    setEditingId(null);
    setEditMode(false);
  };

  //para actualizar el valor en el objeto si se cambia en el html
  const updatevalorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewArea((anterior) => ({ ...anterior, [name]: value }));
  };

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setShowToast(true);
  
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  //obtener lista de areas
  const getAreas = async () => {
    try {
      const res = await fetch("/api/areas");
      const data = await res.json();
      if (Array.isArray(data)) setAreas(data);

    } catch (err) {
      console.error("Error cargando areas:", err);
    }
  };

  //crear nueva area
  const guardarArea = async () => {
    try {
      await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArea),
      });
      limpiarFormulario();
      setShowModal(false);
      mostrarToast("Área registrada correctamente");
      getAreas();

    } catch (err) {
      console.error("Error agregando area:", err);
    }
  };

  //actualizar area 
  const actualizarArea = async () => {
    if (editId === null) return;
    try {
      await fetch(`/api/areas?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArea),
      });
      limpiarFormulario();
      setShowModal(false);
      mostrarToast("Área actualizada correctamente");
      getAreas();

    } catch (err) {
      console.error("Error actualizando area:", err);
    }
  };

  //eliminar area
  const eliminarArea = async (id: number) => {
    if (!confirm("¿Desea eliminar esta área?")) return;
    try {
      await fetch(`/api/areas?id=${id}`, { method: "DELETE" });
      mostrarToast("Área eliminada correctamente");
      getAreas();

    } catch (err) {
      console.error("Error eliminando área:", err);
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
      const res = await fetch(`/api/areas?id=${id}`);
      const data: Area = await res.json();
      setNewArea({ ...data, Estado: "Activo" });
      setEditingId(id);
      setEditMode(true);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando área:", err);
    }
  };

  

  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Áreas de Trabajo</h2>
        <button className="btn btn-primary" onClick={abrirFormulario}>
          <i className="bi bi-plus-square"> </i> Nueva Área
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr className="text-center">
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th colSpan={2}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.Id} className="align-middle">
                <td className="text-center nowrap">{a.Id}</td>
                <td className="text-center nowrap">{a.Nombre}</td>
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
                  <button className="btn btn-danger btn-sm" onClick={() => eliminarArea(a.Id)}>
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal edicion */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? "Actualizar Área" : "Agregar Nueva Área"}</h5>
              <button className="modal-close"onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <label>Nombre del área</label>
              <input type="text" name="Nombre" className="form-control" placeholder="Ingrese el nombre del área" value={newArea.Nombre} onChange={updatevalorChange}/>
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                Cancelar
              </button>
              <button
                className="btn btn-success" onClick={editMode ? actualizarArea : guardarArea} disabled={!newArea.Nombre.trim()}>
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
